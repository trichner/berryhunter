// automatically generated by the FlatBuffers compiler, do not modify

/**
 * @const
 * @namespace
 */
var DeathioApi = DeathioApi || {};

/**
 * @enum
 */
DeathioApi.Item = {
  Fist: 0,
  WoodClub: 1,
  StoneTool: 2,
  BronzeTool: 3,
  IronTool: 4
};

/**
 * @constructor
 */
DeathioApi.Action = function() {
  /**
   * @type {flatbuffers.ByteBuffer}
   */
  this.bb = null;

  /**
   * @type {number}
   */
  this.bb_pos = 0;
};

/**
 * @param {number} i
 * @param {flatbuffers.ByteBuffer} bb
 * @returns {DeathioApi.Action}
 */
DeathioApi.Action.prototype.__init = function(i, bb) {
  this.bb_pos = i;
  this.bb = bb;
  return this;
};

/**
 * @param {flatbuffers.ByteBuffer} bb
 * @param {DeathioApi.Action=} obj
 * @returns {DeathioApi.Action}
 */
DeathioApi.Action.getRootAsAction = function(bb, obj) {
  return (obj || new DeathioApi.Action).__init(bb.readInt32(bb.position()) + bb.position(), bb);
};

/**
 * @returns {DeathioApi.Item}
 */
DeathioApi.Action.prototype.item = function() {
  var offset = this.bb.__offset(this.bb_pos, 4);
  return offset ? /** @type {DeathioApi.Item} */ (this.bb.readUint8(this.bb_pos + offset)) : DeathioApi.Item.Fist;
};

/**
 * @param {flatbuffers.Builder} builder
 */
DeathioApi.Action.startAction = function(builder) {
  builder.startObject(1);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {DeathioApi.Item} item
 */
DeathioApi.Action.addItem = function(builder, item) {
  builder.addFieldInt8(0, item, DeathioApi.Item.Fist);
};

/**
 * @param {flatbuffers.Builder} builder
 * @returns {flatbuffers.Offset}
 */
DeathioApi.Action.endAction = function(builder) {
  var offset = builder.endObject();
  return offset;
};

/**
 * @constructor
 */
DeathioApi.Input = function() {
  /**
   * @type {flatbuffers.ByteBuffer}
   */
  this.bb = null;

  /**
   * @type {number}
   */
  this.bb_pos = 0;
};

/**
 * @param {number} i
 * @param {flatbuffers.ByteBuffer} bb
 * @returns {DeathioApi.Input}
 */
DeathioApi.Input.prototype.__init = function(i, bb) {
  this.bb_pos = i;
  this.bb = bb;
  return this;
};

/**
 * @param {flatbuffers.ByteBuffer} bb
 * @param {DeathioApi.Input=} obj
 * @returns {DeathioApi.Input}
 */
DeathioApi.Input.getRootAsInput = function(bb, obj) {
  return (obj || new DeathioApi.Input).__init(bb.readInt32(bb.position()) + bb.position(), bb);
};

/**
 * @returns {flatbuffers.Long}
 */
DeathioApi.Input.prototype.tick = function() {
  var offset = this.bb.__offset(this.bb_pos, 4);
  return offset ? this.bb.readUint64(this.bb_pos + offset) : this.bb.createLong(0, 0);
};

/**
 * @param {DeathioApi.Vec2f=} obj
 * @returns {DeathioApi.Vec2f}
 */
DeathioApi.Input.prototype.movement = function(obj) {
  var offset = this.bb.__offset(this.bb_pos, 6);
  return offset ? (obj || new DeathioApi.Vec2f).__init(this.bb_pos + offset, this.bb) : null;
};

/**
 * @returns {number}
 */
DeathioApi.Input.prototype.rotation = function() {
  var offset = this.bb.__offset(this.bb_pos, 8);
  return offset ? this.bb.readFloat32(this.bb_pos + offset) : 0.0;
};

/**
 * @param {DeathioApi.Action=} obj
 * @returns {DeathioApi.Action}
 */
DeathioApi.Input.prototype.action = function(obj) {
  var offset = this.bb.__offset(this.bb_pos, 10);
  return offset ? (obj || new DeathioApi.Action).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
};

/**
 * @param {flatbuffers.Builder} builder
 */
DeathioApi.Input.startInput = function(builder) {
  builder.startObject(4);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Long} tick
 */
DeathioApi.Input.addTick = function(builder, tick) {
  builder.addFieldInt64(0, tick, builder.createLong(0, 0));
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} movementOffset
 */
DeathioApi.Input.addMovement = function(builder, movementOffset) {
  builder.addFieldStruct(1, movementOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} rotation
 */
DeathioApi.Input.addRotation = function(builder, rotation) {
  builder.addFieldFloat32(2, rotation, 0.0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} actionOffset
 */
DeathioApi.Input.addAction = function(builder, actionOffset) {
  builder.addFieldOffset(3, actionOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @returns {flatbuffers.Offset}
 */
DeathioApi.Input.endInput = function(builder) {
  var offset = builder.endObject();
  return offset;
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} offset
 */
DeathioApi.Input.finishInputBuffer = function(builder, offset) {
  builder.finish(offset);
};

// Exports for Node.js and RequireJS
this.DeathioApi = DeathioApi;