import React from 'react';
import { Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import dayjs from 'dayjs';

import AppPage from './AppPage';
import EventForm from './EventForm';
import { Button, Content, Feed } from '../shared/SharedComponents';
import { get, showDate, showTime, truncate } from '../shared/SharedFunctions';
import SharedStyles from '../shared/SharedStyles';

// Initialize stack/tab navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Page for displaying upcoming events (feed + calendar view)
export default function UpcomingEventsPage(props) {
  // Central list of page names for consistency
  const pages = {
    createEvent: 'Create Event',
    viewEvent: id => `View Event ${id}`,
    editEvent: id => `Edit Event ${id}`,
    deleteEvent: id => `Delete Event ${id}`,
    listView: 'List View',
    calendarView: 'Calendar View'
  };
  // State variables for display data and state (two-way data binding)
  const [events, setEvents] = React.useState([]);
  const [fetched, setFetched] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [markedDates, setMarkedDates] = React.useState({});
  const formatDate = date => dayjs(date).format(`YYYY-MM-DD`);
  // Update calendar on data change
  React.useEffect(() => {
    let newMarkedDates = {};
    // Update marked events with latest events data
    events.map(event => event.date).forEach(date =>
      newMarkedDates[`${formatDate(date)}`] = { marked: true });
    // Update selected date with current date selection
    newMarkedDates[`${formatDate(selectedDate)}`] =
      { ...newMarkedDates[`${formatDate(selectedDate)}`], selected: true };
    setMarkedDates(newMarkedDates);
  }, [events, selectedDate]);
  // Initial load of events by calling useEffect with [] as second param to run once
  React.useEffect(() => {
    // Wait for all events and trigger update to list by setting flag
    const populate = async () => {
      // Using lorem ipsum data for now with 10 events
      await Promise.all([...Array(10).keys()].map(index =>
        get('https://baconipsum.com/api/?type=all-meat&paras=2').then(description => {
          let newEvents = events;
          newEvents[index] = { id: index + 1, title: `Event ${index + 1}`,
            date: new Date(), location: 'Baltimore, MA, US', description };
          newEvents[index].date.setDate(newEvents[index].date.getDate() + Math.floor(Math.random() * 20 - 10));
          setEvents(newEvents);
        })));
      setFetched(true);
      setSelectedDate(new Date());
    };
    populate();
  }, []);
  return (
    <AppPage {...props}>
      <NavigationContainer style={SharedStyles.container} theme={props.theme} independent>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={props.route.name} children={(localProps) =>
            <>
              {/* Post event (navigate to form) */}
              {props.admin &&
                <Button {...props} {...localProps} text={pages.createEvent}
                  onPress={() => localProps.navigation.push(pages.createEvent)} />}
              {/* Display events as individual cards in scrolling feed */}
              <NavigationContainer style={SharedStyles.container} theme={props.theme} independent>
                {/* Reference: https://reactnavigation.org/docs/bottom-tab-navigator */}
                <Tab.Navigator tabBarOptions={{ labelStyle: {
                  fontSize: 14, margin: 15, textAlignVertical: 'center'
                }}}>
                  <Tab.Screen name={pages.listView} children={() =>
                    <Feed {...props} fetched={fetched} data={events} loadingText='Loading events...'
                      onItemPress={item => localProps.navigation.push(pages.viewEvent(item && item.id))}
                      keyExtractor={(item, index) => `${item ? item.id : index} ${index}`}
                      cardContent={item =>
                        // Display preview of event information
                        item &&
                          <>
                            <Text style={{ color: props.theme.colors.text,
                              fontWeight: 'bold', marginBottom: 10 }}>
                              {item.title}
                            </Text>
                            <Text style={{ color: props.theme.colors.text, marginBottom: 10 }}>
                              <Text>{showDate(item.date)} @ {showTime(item.date)}</Text>
                              <Text style={{ color: props.theme.colors.disabled }}> | </Text>
                              <Text>{item.location}</Text>
                            </Text>
                            <Text style={{ color: props.theme.colors.text }}>
                              {item && truncate(item.description[0], 10)}
                            </Text>
                          </>} />} />
                  <Tab.Screen name={pages.calendarView} children={(localProps) =>
                    <View style={{ flex: 1 }}>
                      {/* Reference: https://github.com/wix/react-native-calendars */}
                      <Calendar style={{ margin: 15 }}
                        // Set key to update on theme change or date selection
                        key={`${props.theme.dark} ${formatDate(selectedDate)}`}
                        markedDates={markedDates} theme={{
                          arrowColor: props.theme.colors.accent,
                          calendarBackground: props.theme.colors.card,
                          dayTextColor: props.theme.colors.text,
                          dotColor: props.theme.colors.primary,
                          monthTextColor: props.theme.colors.text,
                          selectedDayBackgroundColor: props.theme.colors.accent,
                          textDisabledColor: props.theme.colors.disabled,
                          textSectionTitleColor: props.theme.colors.placeholder,
                          todayTextColor: props.theme.colors.accent
                        }} onDayPress={(day) => setSelectedDate(new Date(day.year, day.month - 1, day.day))} />
                    </View>} />
                </Tab.Navigator>
              </NavigationContainer>
            </>} />
          {/* Static page route for creating event */}
          {props.admin &&
            <Stack.Screen name={pages.createEvent} children={(localProps) =>
              // Separate form with no payload to indicate new record
              <EventForm {...props} {...localProps} events={events} setEvents={setEvents} />} />}
          {/* Generated page routes for viewing events */}
          {events.map(event =>
            <Stack.Screen key={event.id} name={pages.viewEvent(event.id)} children={(localProps) =>
              <AppPage {...props} {...localProps} nested>
                {/* Admin controls */}
                {props.admin &&
                  <Button {...props} {...localProps} text='Edit'
                    onPress={() => localProps.navigation.push(pages.editEvent(event.id))} />}
                {props.admin &&
                  <Button {...props} {...localProps} text='Delete'
                    onPress={() => localProps.navigation.push(pages.deleteEvent(event.id))} />}
                {/* Display for individual event */}
                <Content {...props} {...localProps} title={event.title}
                  subtitle={`${showDate(event.date, true)} @ ${showTime(event.date, true)}\n${event.location}`}
                  content={event.description} extraData={fetched} />
              </AppPage>} />)}
          {/* Generated page routes for editing events */}
          {props.admin && events.map(event =>
            <Stack.Screen key={event.id} name={pages.editEvent(event.id)} children={(localProps) =>
              // Separate form with existing record as payload
              <EventForm {...props} {...localProps}
                events={events} setEvents={setEvents} payload={event} />} />)}
          {/* Generated page routes for deleting events */}
          {props.admin && events.map(event =>
            <Stack.Screen key={event.id} name={pages.deleteEvent(event.id)} children={(localProps) =>
              <AppPage {...props} {...localProps} nested cancel>
                {/* Confirm button with prompt, cancel button inherited */}
                <Button {...props} {...localProps} text='Confirm' color='danger'
                  onPress={() => setEvents(events.filter(e => e.id !== event.id))} />
                <Text style={{ color: props.theme.colors.text, margin: 15, textAlign: 'center' }}>
                  Are you sure you want to delete {event.title}?
                </Text>
              </AppPage>} />)}
        </Stack.Navigator>
      </NavigationContainer>
    </AppPage>
  );
};