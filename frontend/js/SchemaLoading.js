requirejs.config({
	paths: {
		schema_common: [
			'schema/common_generated',
			'../../api/schema/js/common_generated'],
		schema_server: [
			'schema/server_generated',
			'../../api/schema/js/server_generated'],
		schema_client: [
			'schema/client_generated',
			'../../api/schema/js/client_generated']
	}
});

//Later
require(['schema_common', 'schema_server', 'schema_client'], function ($) {
	resolveDepencyLoading();
});