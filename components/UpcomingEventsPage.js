import React from 'react';
import { Text, View } from 'react-native';
import { Card } from 'react-native-elements';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import AppPage from './AppPage';
import EmptyPage from './EmptyPage';
import EventForm from './EventForm';
import { Button, Feed } from '../shared/SharedComponents';
import { get } from '../shared/SharedFunctions';
import SharedStyles from '../shared/SharedStyles';

// Initialize stack/tab navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function UpcomingEventsPage(props) {
  const pages = {
    createEvent: 'Create Event',
    viewEvent: id => `View Event ${id}`,
    editEvent: id => `Edit Event ${id}`,
    deleteEvent: id => `Delete Event ${id}`,
    listView: 'List View',
    calendarView: 'Calendar View'
  };
  const [events, setEvents] = React.useState([]);
  const [fetched, setFetched] = React.useState(false);
  // Initial load of events by calling useEffect with [] as second param to run once
  React.useEffect(() => {
    // Wait for all events and trigger update to list by setting flag
    const populate = async () => {
      // Using lorem ipsum data for now with 10 events
      await Promise.all([...Array(10).keys()].map(index =>
        get('https://baconipsum.com/api/?type=all-meat&sentences=1').then(description => {
          let newEvents = events;
          newEvents[index] = { id: index + 1, title: `Event ${index + 1}`, description };
          setEvents(newEvents);
        })));
      setFetched(true);
    };
    populate();
  }, []);
  return (
    <AppPage {...props}>
      <NavigationContainer style={SharedStyles.container} theme={props.theme} independent>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={props.route.name} children={(localProps) =>
            <>
              {props.admin &&
                <Button {...props} {...localProps} text={pages.createEvent}
                  onPress={() => localProps.navigation.push(pages.createEvent)} />}
              <NavigationContainer style={SharedStyles.container} theme={props.theme} independent>
                {/* Reference: https://reactnavigation.org/docs/bottom-tab-navigator */}
                <Tab.Navigator tabBarOptions={{ labelStyle: {
                  fontSize: 14, margin: 15, textAlignVertical: 'center'
                }}}>
                  <Tab.Screen name={pages.listView} children={() =>
                    <Feed {...props} fetched={fetched} data={events} loadingText='Loading events...'
                      onItemPress={item => localProps.navigation.push(pages.viewEvent(item && item.id))}
                      keyExtractor={(item, index) => item ? item.title : index}
                      cardContent={item =>
                        <>
                          <Text style={{ fontWeight: 'bold', color: props.theme.colors.text, marginBottom: 10 }}>
                            {item && item.title}
                          </Text>
                          <Text style={{ color: props.theme.colors.text }}>
                            {item && item.description}
                          </Text>
                        </>} />} />
                  <Tab.Screen name={pages.calendarView} children={(localProps) =>
                    <EmptyPage {...props} {...localProps} nested tab />} />
                </Tab.Navigator>
              </NavigationContainer>
            </>} />
          {props.admin &&
            <Stack.Screen name={pages.createEvent} children={(localProps) =>
              <EventForm {...props} {...localProps} />} />}
          {events.map(event =>
            <Stack.Screen key={event.id} name={pages.viewEvent(event.id)} children={(localProps) =>
              <AppPage {...props} {...localProps} nested>
                {props.admin &&
                  <Button {...props} {...localProps} text='Edit'
                    onPress={() => localProps.navigation.push(pages.editEvent(event.id))} />}
                {props.admin &&
                  <Button {...props} {...localProps} text='Delete'
                    onPress={() => localProps.navigation.push(pages.deleteEvent(event.id))} />}
                <View style={SharedStyles.container}>
                  <Text style={{ color: props.theme.colors.text }}>{localProps.route.name}</Text>
                </View>
              </AppPage>} />)}
          {events.map(event =>
            <Stack.Screen key={event.id} name={pages.editEvent(event.id)} children={(localProps) =>
              <EventForm {...props} {...localProps} />} />)}
          {events.map(event =>
            <Stack.Screen key={event.id} name={pages.deleteEvent(event.id)} children={(localProps) =>
              <EmptyPage {...props} {...localProps} nested cancel />} />)}
        </Stack.Navigator>
      </NavigationContainer>
    </AppPage>
  );
};