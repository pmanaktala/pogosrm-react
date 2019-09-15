import React from 'react';
import {
  Text,
  View,
  Linking,
  SafeAreaView,
  StyleSheet,
  NativeModules,
  TextInput,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Clipboard,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
Icon.loadFont();
import {
  createStackNavigator,
  createBottomTabNavigator,
  createAppContainer,
} from 'react-navigation';
import { Card } from 'react-native-paper';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  total: {
    backgroundColor: '#696969',
    color: 'white',
    padding: 5,
    paddingBottom: 9,
    marginBottom: 0.5,
    height: 15,
  },
  valor: {
    backgroundColor: '#ff6768',
    color: 'white',
    padding: 5,
    paddingBottom: 9,
    marginBottom: 0.5,
    height: 15,
  },
  mystic: {
    backgroundColor: '#1b7fbd',
    color: 'white',
    padding: 5,
    paddingBottom: 9,
    marginBottom: 0.5,
    height: 15,
  },
  instinct: {
    backgroundColor: '#fcf594',
    color: 'white',
    padding: 5,
    paddingBottom: 9,
    marginBottom: 0.5,
    height: 15,
  },
  // container: { padding: 12, paddingTop: 30, backgroundColor: '#fff' },
  // head: { height: 40, backgroundColor: '#f1f8ff' },
  // text: { margin: 6 },
  mycard: { width: '90%', marginBottom: 7 },
  cardBody: {
    backgroundColor: '#f9f3ec',
    padding: 5,
    flexDirection: 'row',
  },
  searchBar: {
    marginTop: 5,
    marginBottom: 5,
    paddingLeft: 10,
    fontSize: 18,
    height: 30,
    borderWidth: 2,
    borderColor: 'black',
  },
  copyArea: {},
});

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: (
        <Text style={{ paddingLeft: 5, fontSize: 20 }}> PokemonGo SRM </Text>
      ),
      headerRight: (
        <TouchableOpacity
          onPress={() => navigation.navigate('MyModal')}
          style={{ padding: 10, marginRight: 5 }}>
          {<Icon name="user-o" size={25} />}
        </TouchableOpacity>
      ),
      /* the rest of this config is unchanged */
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      refreshing: false,
      search: '',
    };
  }

  componentDidMount() {
    fetch('https://pokesrm.pmanaktala.com/react/data.php', {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        global.myData = responseJson;
        this.setState({
          isLoading: false,
          dataSource: responseJson,
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  checkSpoof(json) {
    if (json['Do_you_spoof'] == 'Yes')
      return <Icon name="plane" size={25} />;
    else return <Icon name="male" size={25} />;
  }

  makecolor(json) {
    if (json['Team'] == 'Valor (Red)') return <View style={styles.valor} />;
    if (json['Team'] == 'Instinct (Yellow)')
      return <View style={styles.instinct} />;
    if (json['Team'] == 'Mystic (Blue)') return <View style={styles.mystic} />;
  }

  renderTable() {
    const data = global.myData;
    const myjson = global.myData.filter(
      function(item, index, array) {
        if (this.state.search === '') return true;
        else if (
          data[index]['Trainer_Name']
            .toUpperCase()
            .indexOf(this.state.search.toUpperCase()) > -1
        )
          return true;
        else if (
          data[index]['Name']
            .toUpperCase()
            .indexOf(this.state.search.toUpperCase()) > -1
        )
          return true;
        else if (
          data[index]['Trainer_Code']
            .toUpperCase()
            .indexOf(this.state.search.toUpperCase()) > -1
        )
          return true;
        else return false;
      }.bind(this)
    );
    var table = [];
    for (let i = 0; i < myjson.length; i++) {
      const json = myjson[i];
      table.push(
        <Card style={styles.mycard}>
          {this.makecolor(json)}
          <View style={styles.cardBody}>
            <View style={{ flex: 0.2, align: 'center', paddingTop: 15 }}>
              {this.checkSpoof(json)}
            </View>
            <View style={{ flex: 1.6 }}>
              <View style={{ justifyContent: 'flex-start' }}>
                <Text>Name : {json['Name']}</Text>
                <Text>Trainer Code : {json['Trainer_Code']}</Text>
                <Text>Trainer Name : {json['Trainer_Name']}</Text>
              </View>
            </View>

            <View style={{ flex: 0.2, align: 'center', paddingTop: 15 }}>
              <TouchableOpacity
                onPress={async () => {
                  await Clipboard.setString(
                    json['Trainer_Code'].replace(/^\s+|\s+$/g, '')
                  );
                  alert('Trainer Code Copied');
                }}>
                {<Icon name="clipboard" size={25} />}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.copyArea} />
        </Card>
      );
    }

    return table;
  }

  _onRefresh = () => {
    this.setState({ refreshing: true });
    setTimeout(() => {
      fetch('https://pokesrm.pmanaktala.com/react/data.php', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
        .then(response => response.json())
        .then(responseJson => {
          global.myData = responseJson;
          this.setState({ refreshing: false });
        })
        .catch(error => {
          console.error(error);
        });
    }, 3000);
  };

  setSearchText(event) {
    let searchText = event.nativeEvent.text;
    this.setState({ search: searchText });
    return searchText;
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }>
        <View style={styles.mainContainer}>
          <TextInput
            style={styles.searchBar}
            value={this.state.searchText}
            onChange={this.setSearchText.bind(this)}
            placeholder="Search"
          />
          <View style={{ alignItems: 'center', margin: 3 }}>
            {this.renderTable()}
          </View>
        </View>
      </ScrollView>
    );
  }
}

class AboutScreen extends React.Component {
  static navigationOptions = {
    headerTitle: 'About',
  };

  render() {
    return (
      <SafeAreaView>
        <Text style={{ padding: 5, fontSize: 17 }}>
          This application is for the ease of searching the name/trainer code of
          the player who you are friends with or if you want to add new friends.
          Feel free to come up with suggestions that can be included or ping me
          incase of any errors.
        </Text>
        <Text style={{ margin: 5, fontSize: 17 }}>
          If you want to get yourself added here go to the  
          <Text
            style={{ color: 'blue', margin: 5, fontSize: 17 }}
            onPress={() => Linking.openURL('https://tinyurl.com/pokesrm')}>
            {" "}Google Form
          </Text>
        </Text>
        <Text style={{ margin: 5, fontSize: 17 }}>
          Parent Website -
          <Text
            style={{ color: 'blue', margin: 5, fontSize: 17 }}
            onPress={() => Linking.openURL('https://pokesrm.pmanaktala.com')}>
            {" "}PokemonGo SRM Website
          </Text>
        </Text>
        <Text style={{ margin: 5, fontSize: 17 }}>
          Developed By -
          <Text
            style={{ color: 'blue', margin: 5, fontSize: 17 }}
            onPress={() => Linking.openURL('https://pmanaktala.com')}>
            {" "}pmanaktala
          </Text>
        </Text>
      </SafeAreaView>
    );
  }
}

class infoModelScreen extends React.Component {
  renderDetailsTable() {
    var size = global.myData.length;
    var red = global.myData.filter(function(value) {
      return value.Team === 'Valor (Red)';
    }).length;
    var yellow = global.myData.filter(function(value) {
      return value.Team === 'Instinct (Yellow)';
    }).length;
    var blue = global.myData.filter(function(value) {
      return value.Team === 'Mystic (Blue)';
    }).length;
    var table = [];
    table.push(
      <Card style={styles.mycard}>
        <View style={styles.total} />
        <View style={styles.cardBody}>
          <View style={{ flex: 1.8 }}>
            <View style={{ justifyContent: 'flex-start' }}>
              <Text style={{ fontSize: 20 }}>Total Members - {size}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
    table.push(
      <Card style={styles.mycard}>
        <View style={styles.valor} />
        <View style={styles.cardBody}>
          <View style={{ flex: 1.8 }}>
            <View style={{ justifyContent: 'flex-start' }}>
              <Text style={{ fontSize: 20 }}>Valor - {red}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
    table.push(
      <Card style={styles.mycard}>
        <View style={styles.mystic} />
        <View style={styles.cardBody}>
          <View style={{ flex: 1.8 }}>
            <View style={{ justifyContent: 'flex-start' }}>
              <Text style={{ fontSize: 20 }}>Mystic - {blue}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
    table.push(
      <Card style={styles.mycard}>
        <View style={styles.instinct} />
        <View style={styles.cardBody}>
          <View style={{ flex: 1.8 }}>
            <View style={{ justifyContent: 'flex-start' }}>
              <Text style={{ fontSize: 20 }}>Instinct - {yellow}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
    return table;
  }
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ margin: 6, fontSize: 22 }}>
          Details of the current Players{' '}
        </Text>
        {this.renderDetailsTable()}
      </View>
    );
  }
}
const HomeStack = createStackNavigator({
  Home: { screen: HomeScreen },
  MyModal: { screen: infoModelScreen },
});

const UploadStack = createStackNavigator({
  About: { screen: AboutScreen },
});

export default createAppContainer(
  createBottomTabNavigator(
    {
      Home: { screen: HomeStack },
      About: { screen: UploadStack },
    },
    {
      defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
          const { routeName } = navigation.state;
          let iconName;
          if (routeName === 'Home') {
            return <Icon name="home" size={25} color={tintColor} />;
          } else if (routeName === 'About') {
            return (
              <Icon name="info-circle" size={25} color={tintColor} />
            );
          }
        },
      }),
      tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      },
    }
  )
);
