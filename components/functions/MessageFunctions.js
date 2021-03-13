import { get, post } from '../../shared/SharedFunctions';

// Fetch messages and populate component state array
export const fetchMessages = (props, setMessages, callback) => {
  get(`${props.baseURL}/messages`)
    .then(response => {
      let names = {};
      Promise.all(response.map(item =>
        get(`${props.baseURL}/accounts/${item.sender}`)
          .then(account =>
            names[item.sender] =
              account && account.account
                ? `${account.account.firstName} ${account.account.lastName} (@${account.account.username})`
                : 'Unknown User')
          .catch(() => names[item.sender] = 'Unknown User')
        ))
        .then(() => setMessages(response.map(item => ({
          id: item._id,
          sender: names[item.sender],
          message: item.message,
          sentAt: item.sentAt,
          profilePicture: item.profilePicture
            || 'https://png.pngitem.com/pimgs/s/4-40070_user-staff-man-profile-user-account-icon-jpg.png'
        }))))
        .finally(callback);
    })
    .catch(error => {
      console.error(error);
      props.snackbar('Unable to fetch messages');
      callback();
    });
};

// Handle submit action to send a new message
export const sendMessage = (props, setMessages, newMessage, setNewMessage, list, callback) => {
  if (newMessage.trim() === '') {
    props.snackbar('Message is empty');
    return;
  }
  post(`${props.baseURL}/messages/add`, { sender: props.user._id, message: newMessage })
    // Clear message input field and scroll to bottom
    .then(() => {
      setNewMessage('');
      setTimeout(() => list.scrollToEnd({ animated: true }), 250);
    })
    // Display message if failed
    .catch(error => console.error(error) && props.snackbar('Failed to update database'))
    .finally(() => fetchMessages(props, setMessages, callback));
}