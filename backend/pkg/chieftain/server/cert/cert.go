package cert

import (
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha1"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"fmt"
	"log/slog"
	"math/big"
	"net"
	"os"
	"path/filepath"
	"time"
)

type Bundle struct {
	CACertFile string
	CAKeyFile  string

	ServerCertFile string
	ServerKeyFile  string

	ClientCertFile string
	ClientKeyFile  string
}

func GenerateServerCertificate(dir string, hosts []string, ips []string) (*Bundle, error) {
	return generateCertificates(dir, hosts, ips)
}

func generateCertificates(dir string, hosts []string, ips []string) (*Bundle, error) {
	sub := pkix.Name{
		CommonName:   "Berryhunter",
		Organization: []string{"Berryhunter"},
	}

	caCertBytes, caCert, caKey, err := generateCaCertificate(pkix.Name{CommonName: "Berryhunter CA"})
	if err != nil {
		return nil, fmt.Errorf("failed to create CA certificate: %w", err)
	}

	serverCertBytes, serverKey, err := generateServerCertificate(hosts, ips, sub, caCert, caKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create server certificate: %w", err)
	}

	clientCertBytes, clientKey, err := generateClientCertificate(sub, caCert, caKey)
	if err != nil {
		return nil, fmt.Errorf("failed to create client certificate: %w", err)
	}

	caCertFile := filepath.Join(dir, "ca_cert.pem")
	err = saveCert(caCertFile, caCertBytes)
	if err != nil {
		return nil, err
	}

	caKeyFile := filepath.Join(dir, "ca_key.pem")
	err = saveKey(caKeyFile, caKey)
	if err != nil {
		return nil, err
	}

	serverCertFile := filepath.Join(dir, "server_cert.pem")
	err = saveCert(serverCertFile, serverCertBytes)
	if err != nil {
		return nil, err
	}
	serverKeyFile := filepath.Join(dir, "server_key.pem")
	err = saveKey(serverKeyFile, serverKey)
	if err != nil {
		return nil, err
	}

	clientCertFile := filepath.Join(dir, "client_cert.pem")
	err = saveCert(clientCertFile, clientCertBytes)
	if err != nil {
		return nil, err
	}
	clientKeyFile := filepath.Join(dir, "client_key.pem")
	err = saveKey(clientKeyFile, clientKey)
	if err != nil {
		return nil, err
	}

	return &Bundle{
		CACertFile:     caCertFile,
		CAKeyFile:      caKeyFile,
		ServerCertFile: serverCertFile,
		ServerKeyFile:  serverKeyFile,
		ClientCertFile: clientCertFile,
		ClientKeyFile:  clientKeyFile,
	}, nil
}

func generateClientCertificate(subject pkix.Name, caCertTemplate *x509.Certificate, caKey ed25519.PrivateKey) ([]byte, ed25519.PrivateKey, error) {
	serialNumber := mustGenerateSerial()

	cert := &x509.Certificate{
		SerialNumber:          serialNumber,
		Subject:               subject,
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0),
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth},
		KeyUsage:              x509.KeyUsageDigitalSignature,
		BasicConstraintsValid: true,
	}

	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate private key: %w", err)
	}

	certBytes, err := x509.CreateCertificate(rand.Reader, cert, caCertTemplate, pub, caKey)
	if err != nil {
		return nil, nil, err
	}

	return certBytes, priv, nil
}

func generateServerCertificate(hosts []string, ips []string, subject pkix.Name, caCertTemplate *x509.Certificate, caKey ed25519.PrivateKey) ([]byte, ed25519.PrivateKey, error) {
	serialNumber := mustGenerateSerial()

	ipAddrs := make([]net.IP, len(ips))
	for i, ip := range ips {
		ipAddrs[i] = net.ParseIP(ip)
	}

	cert := &x509.Certificate{
		SerialNumber:          serialNumber,
		Subject:               subject,
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0),
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		KeyUsage:              x509.KeyUsageDigitalSignature,
		DNSNames:              hosts,
		IPAddresses:           ipAddrs,
		BasicConstraintsValid: true,
	}

	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate private key: %w", err)
	}

	certBytes, err := x509.CreateCertificate(rand.Reader, cert, caCertTemplate, pub, caKey)
	if err != nil {
		return nil, nil, err
	}

	return certBytes, priv, nil
}

func generateCaCertificate(subject pkix.Name) ([]byte, *x509.Certificate, ed25519.PrivateKey, error) {
	notBefore := time.Now()

	notAfter := notBefore.AddDate(10, 0, 0)

	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to generate private key: %w", err)
	}

	// ECDSA, ED25519 and RSA subject keys should have the DigitalSignature
	// KeyUsage bits set in the x509.Certificate template
	keyUsage := x509.KeyUsageDigitalSignature + x509.KeyUsageCertSign

	serialNumber := mustGenerateSerial()

	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to generate serial number: %w", err)
	}

	id := sha1.Sum(pub)

	template := &x509.Certificate{
		SubjectKeyId:          id[:],
		SerialNumber:          serialNumber,
		Subject:               subject,
		NotBefore:             notBefore,
		NotAfter:              notAfter,
		KeyUsage:              keyUsage,
		BasicConstraintsValid: true,
		IsCA:                  true,
		IPAddresses:           nil, // could add IPs
	}

	caCertBytes, err := x509.CreateCertificate(rand.Reader, template, template, pub, priv)

	return caCertBytes, template, priv, err
}

func saveCert(certFile string, derBytes []byte) error {
	certOut, err := os.Create(certFile)
	if err != nil {
		return fmt.Errorf("failed to open %q for writing: %w", certFile, err)
	}

	if err := pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: derBytes}); err != nil {
		return fmt.Errorf("failed to write data to %q: %w", certFile, err)
	}

	if err := certOut.Close(); err != nil {
		return fmt.Errorf("error closing %q: %w", certFile, err)
	}

	p, err := filepath.Abs(certOut.Name())
	if err != nil {
		p = certOut.Name()
	}
	slog.Debug("wrote "+certFile, slog.String("path", p))

	return nil
}

func saveKey(keyFile string, key ed25519.PrivateKey) error {
	pkcs8Bytes, err := x509.MarshalPKCS8PrivateKey(key)
	if err != nil {
		return fmt.Errorf("failed to PKCS8 encode key: %w", err)
	}

	keyOut, err := os.OpenFile(keyFile, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0o600)
	if err != nil {
		return fmt.Errorf("failed to open %q for writing: %w", keyFile, err)
	}

	if err := pem.Encode(keyOut, &pem.Block{Type: "PRIVATE KEY", Bytes: pkcs8Bytes}); err != nil {
		return fmt.Errorf("failed to write data to %q: %w", keyFile, err)
	}

	if err := keyOut.Close(); err != nil {
		return fmt.Errorf("error closing %q: %w", keyFile, err)
	}

	p, err := filepath.Abs(keyOut.Name())
	if err != nil {
		p = keyOut.Name()
	}
	slog.Debug("wrote "+keyFile, slog.String("path", p))
	return nil
}

func mustGenerateSerial() *big.Int {
	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		panic(fmt.Errorf("failed to generate serial number: %w", err))
	}
	return serialNumber
}
