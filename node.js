module.exports = function (RED) {
  function iskra_sml_parser(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    //> modul global variable
    let output = Array(11);
    output[0] = { 'payload': 0 };
    output[1] = { 'payload': 0 };
    output[2] = { 'payload': 0 };

    //> dso declaration:
    node.on('input', function (msg) {
      //> implement:

      let push_tlg = Buffer.from(msg.payload);

      output[0].payload = decode_secIndex_by_Listname(push_tlg);
      output[1].payload = decode_obis_valueInt64(push_tlg, [0x01, 0x00, 0x01, 0x08, 0x00, 0xFF]);
      output[2].payload = decode_obis_valueInt32(push_tlg, [0x01, 0x00, 0x10, 0x07, 0x00, 0xFF]);

      node.send([output[0], output[1], output[2]]);
    });
  }
  RED.nodes.registerType("node-red-iskra-info-tlg", iskra_sml_parser);
}






//>@   decode energie Uint64
function decode_obis_valueInt64(tlg, obisi) {
  let retVal = 0;
  const offset = 13;
  let start = 0;
  let end = 0;
  let devider_arr = [];
  let value_buffer = new Uint8Array(8); //> Wert aus 8 byte
  let devider = 1;
  const status_byte = 0x65;
  let status_offset = 0;

  //> implement:
  let obis_index = search_obis_index(tlg, obisi); //> console.log('obis_index=', obis_index);

  if (obis_index > 0) {
    //>---status----
    if (status_byte === tlg[obis_index + 6]) {
      status_offset = 4;
    }
    //>---status----

    //>----value buffer---
    start = obis_index + offset + status_offset;
    end = start + 8; //> Int64
    value_buffer = tlg.slice(start, end); //>for (let i of buffer) console.log(i);
    //>----value buffer---

    //--devider--
    devider_arr = tlg.slice(obis_index + 11 + status_offset, obis_index + 12 + status_offset); //>for (let i of devider_arr) console.log(i);

    let viewInt = new DataView(devider_arr.buffer, devider_arr.byteOffset, devider_arr.byteLength);
    devider = Math.pow(10, viewInt.getInt8(0));//> 10^(-x)
    //> console.log('devider=', devider);
    //--devider--end--

    let view = new DataView(value_buffer.buffer, value_buffer.byteOffset, value_buffer.byteLength);
    retVal = Number(view.getBigInt64(0)) * devider;
  }
  return retVal.toFixed(2);
}


//>@   decode sekunden_index uint32
function decode_secIndex_by_Listname(tlg) {
  let retVal = 0;
  let start = 0;
  let end = 0;
  let value_buffer = new Uint8Array(4);
  let listName = new Uint8Array([0x01, 0x00, 0x62, 0x0A, 0xFF, 0xFF]);
  let index = search_obis_index(tlg, listName); console.log('index=', index);

  if (index > 0) {
    //>----value buffer---
    start = index + 10;
    end = start + 4; //> Int32
    value_buffer = tlg.slice(start, end); //>for (let i of value_buffer) console.log(i);
    //>----value buffer---

    let view = new DataView(value_buffer.buffer, value_buffer.byteOffset, value_buffer.byteLength);
    retVal = view.getInt32(0);
  }
  return retVal;
}

//>@   decode value Int32
function get_obis_valueInt16(tlg, obisi) {
  let retVal = 0;
  const offset = 13;
  let start = 0;
  let end = 0;
  let devider_arr = [];
  let devider = 1;
  let value_buffer = new Uint8Array(2); //> Value aus 2 Byte
  const status_byte = 0x65;
  let status_offset = 0;

  //> implement:

  let obis_index = search_obis_index(tlg, obisi);

  if (obis_index > 0) {

    //>---status----
    if (status_byte === tlg[obis_index + 6]) {
      status_offset = 4;
    }
    //>---status--end--

    //>----value buffer---
    start = obis_index + offset + status_offset;
    end = start + 2; //> Uint16
    value_buffer = tlg.slice(start, end);
    //>----value buffer--end--

    //--devider--
    //> devider_arr = tlg.slice(obis_index + 11, obis_index + 12);
    devider_arr = tlg.slice(obis_index + status_offset + (offset - 2), obis_index + status_offset + (offset - 1));
    let viewInt = new DataView(devider_arr.buffer, devider_arr.byteOffset, devider_arr.byteLength);
    devider = Math.pow(10, viewInt.getInt8(0));//> 10^(-x)
    //>console.log('devider=', devider);
    //--devider--end--

    let view = new DataView(value_buffer.buffer, value_buffer.byteOffset, value_buffer.byteLength);
    retVal = view.getUint16(0) * devider;
  }
  return retVal.toFixed(2);
}

function decode_obis_valueInt32(tlg, obisi) {
  let retVal = 0;
  const offset = 13; //> bis zu Value
  let start = 0;
  let end = 0;
  let devider_arr = [];
  let value_buffer = new Uint8Array(4);//> Wert aus 4 Byte
  let devider = 1;
  const status_byte = 0x65;
  let status_offset = 0;

  //> implement:

  let obis_index = search_obis_index(tlg, obisi);

  if (obis_index > 0) {

    //>---status----
    if (status_byte === tlg[obis_index + 6]) {
      status_offset = 4;
    }
    //>---status--end--

    //>----value buffer---
    start = obis_index + offset;
    end = start + 4;
    value_buffer = tlg.slice(start, end);
    //>----value buffer---

    //--devider--
    devider_arr = tlg.slice(obis_index + 11 + status_offset, obis_index + 12 + status_offset);

    let viewInt = new DataView(devider_arr.buffer, devider_arr.byteOffset, devider_arr.byteLength);
    devider = Math.pow(10, viewInt.getInt8(0)); //> 10^(-x)
    //> console.log('devider=', devider);
    //--devider--end--

    let view = new DataView(value_buffer.buffer, value_buffer.byteOffset, value_buffer.byteLength);
    retVal = Number(view.getInt32(0)) * devider;
  }
  return retVal.toFixed(2);
}


function search_obis_index(tlg, obis) {
  let retVal = 0;
  for (let i = 0; i < tlg.length; i++) {
    if (tlg[i + 0] === obis[0])
      if (tlg[i + 1] === obis[1])
        if (tlg[i + 2] === obis[2])
          if (tlg[i + 3] === obis[3])
            if (tlg[i + 4] === obis[4])
              if (tlg[i + 5] === obis[5]) {
                retVal = i;
                break;
              }
  }
  return retVal;
}