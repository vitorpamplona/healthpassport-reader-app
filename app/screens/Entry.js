import React, { useState, useEffect } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text, View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useIsFocused } from "@react-navigation/native";

import VaccineCard from './../components/VaccineCard';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-community/async-storage';
import { SearchBar } from 'react-native-elements';

import { FloatingAction } from "react-native-floating-action";

function Entry({ navigation }) {
  const [vaccines, setVaccines] = useState([]);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [search, setSearch] = useState('');
  const isFocused = useIsFocused();

  const onNewVaccine = (e) => {
    navigation.navigate('QRReader')
  }

  const actions = [{
      text: "New Vaccine",
      icon:  <FontAwesome5 name={'syringe'} style={styles.icon} solid />,
      name: "bt_vaccine",
      position: 0
    }
  ];

  const filter = (vaccines, text) => {
    if (text && text.length > 0) { 
      const lowerText = text.toLowerCase();
      return vaccines.filter(function (item) {
          return (item.vaccinee && item.vaccinee.toLowerCase().includes(lowerText))
              || (item.vaccinator && item.vaccinator.toLowerCase().includes(lowerText));
        });
    } else {
      return vaccines;
    }
  }

  const searchFilter = (text) => {
    setFilteredVaccines(filter(vaccines, text));
    setSearch(text);
  }

  const load = async () => {
    try {
      let ks = await AsyncStorage.getAllKeys();
      let curated =  ks.filter((key) => key.startsWith('CARDS'));
      let vaccinesStr = await AsyncStorage.multiGet(curated);
      let vaccines = [];
      vaccinesStr.forEach((item) =>
          vaccines.push(JSON.parse(item[1]))
      );
      vaccines = vaccines.sort((a,b) => new Date(b.date) - new Date(a.date));
      setVaccines(vaccines);
      setFilteredVaccines(filter(vaccines, search));
    } catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    load();
    console.log("useEffect Called");
  }, [isFocused]);

  const onDelete = (e) => {
    console.log("OnDelete");
		AsyncStorage.clear();
    load();
  }

  return (
    <View style={styles.container}>
      <SearchBar round 
          placeholder="Type Here..."
          onChangeText={text => searchFilter(text)}
          value={search}
        />

      <FlatList 
        data={filteredVaccines} 
        keyExtractor={item => item.signature} 
        renderItem={({item}) => <VaccineCard detail={item} />} />

      <FloatingAction
        actions={actions}
        overrideWithAction={true}
        onPressItem={onNewVaccine}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  icon:{
		color:'#fff',
		paddingRight: 0,
		fontSize:25
	}
});

export default Entry;