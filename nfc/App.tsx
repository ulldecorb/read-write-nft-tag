import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';

// Pre-step, call this before any NFC operations
NfcManager.start();

// const [nfc.nir, setNfcCore] = useState([]);
function App() {
  const [nfc, setNfc] = useState('');
  const [nfcCore, setNfcCore] = useState({uid: '2812', msg: 'no data yet'});

  const mockNdef = {
    uid: '666',
    msg: 'servir cafe',
  };

  async function readTag() {
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.Ndef);
      // the resolved tag object will contain `ndefMessage` property
      const tag = await NfcManager.getTag();
      // Get payload CharCode
      const payload: any = tag?.ndefMessage[0].payload;
      console.log('payload: ', payload);
      // Convert to string and slice extra characters
      let payloadString = convertedPayload(payload);
      console.log('payloadString: ', payloadString);
      const payloadStringCut = convertString(payloadString);
      console.log('payloadStringCut: ', payloadStringCut);
      // Compile String to Object
      const payloadObject: any = JSON.parse(payloadStringCut);
      console.log('payloadObject: ', payloadObject.uid);
      // Set payload
      setNfc(payloadString);
      setNfcCore(payloadObject);
      NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.warn('Oops!', error);
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  }

  async function writeNdef() {
    let result = false;
    try {
      // STEP 1
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([Ndef.textRecord('servir cafe')]);
      if (bytes) {
        await NfcManager.ndefHandler // STEP 2
          .writeNdefMessage(bytes); // STEP 3
        result = true;
      }
    } catch (ex) {
      console.warn(ex);
    } finally {
      // STEP 4
      NfcManager.cancelTechnologyRequest();
    }
    return result;
  }

  function convertString(input: string): string {
    // const result = input.replace(/☻\w+/, '');
    const result = input.split('').slice(3).join('');
    return result;
  }

  // const convertedPayload = payload =>
  //   payload.map(code => String.fromCharCode(code)).join('');

  const convertedPayload = (payload: any[] | undefined): string => {
    const res: string =
      payload.map(code => String.fromCharCode(code)).join('') ?? '';
    return res;
  };

  // const readNdef = () => {
  //   console.log('hola jana');
  // };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={readTag} style={styles.button}>
        <Text style={styles.buttonTitle}>Scan a Tag</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={writeNdef} style={styles.button}>
        <Text style={styles.buttonTitle}>Write a Tag</Text>
      </TouchableOpacity>
      {nfcCore && (
        <View>
          <View style={styles.tagInfoBox}>
            <Text>UID: </Text>
            <Text>{nfcCore.uid}</Text>
          </View>
          <View style={styles.tagInfoBox}>
            <Text>Message:</Text>
            <Text>{nfcCore.msg}</Text>
          </View>
          {nfcCore.val ? (
            <View style={styles.tagInfoBox}>
              <Text>Accepted</Text>
            </View>
          ) : (
            <View style={styles.tagInfoBox}>
              <Text>Rejected</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ledger = {id_user, id_machine, product: 'cafe', id_currency: 'EUR', value: '0.75', type: 'purchase'}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#a0a0a0',
    padding: 25,
    borderRadius: 8,
    overflow: 'hidden',
    margin: 5,
  },
  buttonTitle: {
    color: '#fff',
  },
  tagInfoBox: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  // tagInfoTitle: {
  //   flex: 1,
  // },
  // tagInfoValue: {
  //   flex: 1,
  // },
});

export default App;
