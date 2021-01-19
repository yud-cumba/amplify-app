
import React, { useState, useEffect } from "react";
import "./App.css";
import { S3Album } from 'aws-amplify-react';
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { API, graphqlOperation, Analytics, Auth, Storage } from "aws-amplify";
import "@aws-amplify/ui/dist/style.css";

const listTodos = `query listTodos {
  listTodos{
    items{
      id
      name
      description
    }
  }
}`;
const addTodo = `mutation createTodo($name:String! $description: String!) {
  createTodo(input:{
    name:$name
    description:$description
  }){
    id
    name
    description
  }
}`;

function App() {
  const [ userName, setUserName] = useState('');
  const [ fileName, setFileName ] = useState('');

  useEffect(() => {
    (async ()=> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setUserName(user.username);
    } catch (err) {
      console.log("error getting user: ", err);
    }
  })()
  });
const uploadFile = (evt) => {
  const file = evt.target.files[0];
  const name = file.name;
  Storage.put(name, file).then(() => {
    setFileName(name);
  })
}

const recordEvent = () => {
  Analytics.record({
    name: "My test event",
    attributes: {
      username: userName,
    }
  });
};
const fileToKey = (data) => {
  const { name, size, type } = data;
  return 'test_' + name;
}
  const todoMutation = async () => {
    const todoDetails = {
      name: 'Party tonight!',
      description: 'Amplify CLI rocks!'
    };
  const newTodo = await API.graphql(graphqlOperation(addTodo, todoDetails));
    alert(JSON.stringify(newTodo));
  };
  const listQuery = async () => {
    console.log('listing todos');
    const allTodos = await API.graphql(graphqlOperation(listTodos));
    alert(JSON.stringify(allTodos));
  };
  
  return (
    <div className="App">
        <AmplifySignOut />
        <p> Click a button </p>
        <button onClick={listQuery}>GraphQL List Query</button>
        <button onClick={todoMutation}>GraphQL Todo Mutation</button>
        <button onClick={recordEvent}>Record Event</button>
        <p> Pick a file</p>
        <p>{fileName}</p>
        <input type="file" onChange={uploadFile} />
        <S3Album path="pictures/" picker fileToKey={fileToKey} />
      </div>
  );
}

export default withAuthenticator(App, true);
