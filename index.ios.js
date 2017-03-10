/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';

import {
  AlertIOS,
  Animated,
  AppRegistry,
  SegmentedControlIOS,
  StatusBar,
  StyleSheet,
  Switch,
  TabBarIOS,
  Text,
  TouchableHighlight,
  WebView,
  View
} from 'react-native';

import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TableView from 'react-native-tableview';
import NavigationBar from 'react-native-navbar';

export default class TestProject extends Component {
  constructor(props) {
    super(props);

    this.geolocate = this.geolocate.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.selectSaved = this.selectSaved.bind(this);
    this.tableViewChange = this.tableViewChange.bind(this);
    this.toggleWebview = this.toggleWebview.bind(this);

    this.zoomIncrement = 0.04;

    let savedLocations = [
      {
        name: 'Kennywood',
        description: 'Traditional amusement park with seven roller coasters',
        latitude: 40.387527,
        longitude: -79.864479,
        url: 'https://en.wikipedia.org/wiki/Kennywood'
      },
      {
        name: 'Sandcastle',
        description: 'Water park with slides, lazy river, and a wave pool',
        latitude: 40.396607,
        longitude: -79.930030,
        url: 'https://en.wikipedia.org/wiki/Sandcastle_Waterpark'
      },
      {
        name: 'Idlewild and SoakZone',
        description: 'Family-friendly amusement park with rides and water slides',
        latitude: 40.262073,
        longitude: -79.276286,
        url: 'https://en.wikipedia.org/wiki/Idlewild_and_Soak_Zone'
      }
    ];

    this.navbarSettings = {
      style: {
        backgroundColor: '#3C97CD'
      },
      statusBar: {
        tintColor: '#3C97CD',
        style: 'light-content'
      }
    };

    this.webviewConfig = {
      hidden: 550,
      visible: 0
    };

    this.state = {
      satelliteEnabled: false,
      selectedTab: 'map',
      mapTypes: ['Standard', 'Satellite', 'Hybrid'],
      selectedMapType: 0,
      locationPin: null,
      selectedLocationIndex: null,
      selectedLocation: null,
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      },
      savedLocations: savedLocations,
      settings: {
        showsTraffic: true
      },
      webviewVisible: false,
      currentUrl: 'https://www.google.com',
      bounceValue: new Animated.Value(540)
    };
  }

  geolocate() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.map.animateToCoordinate(position.coords);
      },
      (error) => {
        alert(JSON.stringify(error));
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  zoomIn() {
    this.setState({
      region: {
        latitude: this.state.region.latitude,
        longitude: this.state.region.longitude,
        latitudeDelta: this.state.region.latitudeDelta - this.zoomIncrement,
        longitudeDelta: this.state.region.longitudeDelta - this.zoomIncrement
      }
    });
  }

  zoomOut() {
    this.setState({
      region: {
        latitude: this.state.region.latitude,
        longitude: this.state.region.longitude,
        latitudeDelta: this.state.region.latitudeDelta + this.zoomIncrement,
        longitudeDelta: this.state.region.longitudeDelta + this.zoomIncrement
      }
    });
  }

  selectSaved(rowId) {
    const saved = this.state.savedLocations[rowId];
    this.state.selectedLocation = saved;

    const updatedRegion = Object.assign({}, this.state.region, {
      latitude: saved.latitude,
      longitude: saved.longitude
    });

    StatusBar.setBarStyle('dark-content', true);

    this.setState({
      region: updatedRegion,
      selectedTab: 'map',
      locationPin: {
        coordinate: {
          latitude: updatedRegion.latitude,
          longitude: updatedRegion.longitude,
        },
        title: saved.name
      },
      currentUrl: saved.url,
      selectedLocationIndex: rowId
    });
  }

  tableViewChange(data) {
    if (data.mode === 'delete') {
      this.setState({
        savedLocations: this.state.savedLocations.splice(data.selectedIndex, 1)
      });
    }
  }

  toggleWebview() {
    Animated.spring(this.state.bounceValue, {
      toValue: this.state.webviewVisible ? this.webviewConfig.hidden : this.webviewConfig.visible
    }).start();

    this.setState({
      webviewVisible: !this.state.webviewVisible
    });
  }

  render() {
    return (
      <TabBarIOS>
        <Icon.TabBarItem
          title="Map"
          iconName="map"
          onPress={() => {
            StatusBar.setBarStyle('dark-content', true);

            this.setState({
              selectedTab: 'map'
            });
          }}
          selected={this.state.selectedTab === 'map'}
          selectedIconName="map">
          <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <MapView
              onLongPress={() => alert('long press!')}
              style={styles.map}
              showsTraffic={this.state.settings.showsTraffic}
              mapType={this.state.mapTypes[this.state.selectedMapType].toLowerCase()}
              initialRegion={this.state.region}
              region={this.state.region}
              ref={(component) => this.map = component}
              legalLabelInsets={{bottom: 10, left: 100}}
            >
              {this.state.locationPin &&
                <MapView.Marker
                  coordinate={this.state.locationPin.coordinate}
                  ref={(component) => this.marker = component}
                >
                  <MapView.Callout>
                    <View style={styles.callout}>
                      <Text style={styles.calloutTitle}>{this.state.selectedLocation.name}</Text>
                      <Text style={styles.calloutDescription}>{this.state.selectedLocation.description}</Text>
                      <Icon name="wikipedia" size={30} backgroundColor="rgba(0,0,0,0)" style={{marginTop: 5}} onPress={() => {
                        this.setState({
                          currentUrl: this.state.selectedLocation.url
                        });

                        this.toggleWebview();
                      }} />
                    </View>
                  </MapView.Callout>
                </MapView.Marker>
              }
            </MapView>
            <SegmentedControlIOS
              style={styles.segmentedControl}
              values={this.state.mapTypes}
              selectedIndex={this.state.selectedMapType}
              onChange={(event) => {
                this.setState({
                  selectedMapType: event.nativeEvent.selectedSegmentIndex
                });
              }}
            />
            <Icon name="plus-circle-outline" style={styles.zoomIn} size={40} onPress={this.zoomIn} />
            <Icon name="minus-circle-outline" style={styles.zoomOut} size={40} onPress={this.zoomOut} />
            <Icon name="target" style={styles.geolocate} size={40} onPress={this.geolocate} />
            <Animated.View style={[styles.browserContainer, {transform: [{translateY: this.state.bounceValue}]}]}>
              <Text
                style={styles.closeButton}
                onPress={this.toggleWebview}
              >
                Done
              </Text>
              <WebView
                source={{url: this.state.currentUrl}}
              />
            </Animated.View>
          </View>
        </Icon.TabBarItem>
        <Icon.TabBarItem
          title="Saved"
          iconName="pin"
          onPress={() => {
            this.setState({
              selectedTab: 'saved'
            });
          }}
          selected={this.state.selectedTab === 'saved'}
          selectedIconName="pin"
        >
          <View style={{flex: 1}}>
            <NavigationBar {...this.navbarSettings} title={{title: "Saved Locations", tintColor: "white"}} />
            <TableView
              style={{flex: 1}}
              tableViewStyle={TableView.Consts.Style.Grouped}
              tableViewCellStyle={TableView.Consts.CellStyle.Subtitle}
              onPress={(event) => {this.selectSaved(event.selectedIndex)}}
            >
              <TableView.Section canEdit={true} onChange={this.tableViewChange}>
                {this.state.savedLocations.map((location, index) => {
                  return <TableView.Item key={index}>{location.name}</TableView.Item>
                })}
              </TableView.Section>
            </TableView>
          </View>
        </Icon.TabBarItem>
        <Icon.TabBarItem
          title="Settings"
          iconName="settings"
          onPress={() => {
            this.setState({
              selectedTab: 'settings'
            });
          }}
          selected={this.state.selectedTab === 'settings'}
        >
          <View style={{flex: 1}}>
            <NavigationBar {...this.navbarSettings} title={{title: "Settings", tintColor: "white"}} />
            <TableView
              style={{flex: 1}}
              tableViewStyle={TableView.Consts.Style.Grouped}
              tableViewCellStyle={TableView.Consts.CellStyle.Subtitle}
            >
              <TableView.Section>
                <TableView.Cell style={styles.cell}>
                  <Text>Show Traffic</Text>
                  <Switch
                    style={{marginRight: 16}}
                    value={this.state.settings.showsTraffic}
                    onValueChange={(value) => {
                      this.setState({
                        settings: {
                          showsTraffic: value
                        }
                      });
                    }}
                  />
                </TableView.Cell>
              </TableView.Section>
            </TableView>
          </View>
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    marginBottom: 50
  },
  segmentedControl: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 4
  },
  geolocate: {
    position: 'absolute',
    bottom: 60,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'rgb(0,122,255)'
  },
  zoomIn: {
    position: 'absolute',
    left: 10,
    bottom: 100,
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'rgb(0,122,255)'
  },
  zoomOut: {
    position: 'absolute',
    left: 10,
    bottom: 60,
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'rgb(0,122,255)'
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E'
  },
  row: {
    padding: 10
  },
  cell: {
    flexDirection: 'row',
    height: 44,
    paddingLeft: 16,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  browserContainer: {
    position: 'absolute',
    top: 70,
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingTop: 40
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 10,
    color: 'rgb(0,122,255)',
    fontSize: 20
  },
  callout: {
    flex: 1,
    flexDirection: 'column',
    width: 200
  },
  calloutTitle: {
    fontSize: 15
  },
  calloutDescription: {
    fontSize: 10
  }
});

AppRegistry.registerComponent('TestProject', () => TestProject);
