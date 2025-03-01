import React, { useState, useEffect } from 'react'
import _ from 'lodash';

function App() {

  const [data, setData] = useState([{}])

  const [spanish_data, spanish_setData] = useState(null)

  useEffect(() => {
    fetch("/languages").then(
      res => res.json()
    ).then(
      data => {
        setData(data)
        console.log(data)
      }
    )
  }, [])

  useEffect(() => {
    fetch("/spanish").then(
      res => res.json()
    ).then(
      spanish_data => {
        spanish_setData(spanish_data)
        console.log(spanish_data)
      }
    )
  }, [])


  // function to convert lesson plan json into presentable data
  const renderData = (data) => {

    // undefined parameter
    if (data === undefined || data === null) {
      return <span>No data available</span>;
    }

    // if data is an array, generate a list of all its contents
    if (_.isArray(data)) {
      return (
        <ul>
          {data.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    // if data is an object, treat it like a subheading and make a recursive call
    if (_.isObject(data)) {
      return (
        <ul>
          {_.map(data, (value, key) => (
            <li key={key}>
              <strong>{key}:</strong> {renderData(value)}
            </li>
          ))}
        </ul>
      );
    }

    // if data is primitive, return it
    return <span>{data}</span>;
  };

  return (
    <>
      <div>

          {(typeof data.languages === 'undefined') ? (
            <p>Loading...</p>
          ) : (
              data.languages.map((language, i) => (
                  <p key={i}>{language}</p>
              ))

          )}

      </div>

      <div>
        <h2>Lesson Plan</h2>
        {!data ? (
          <p>Loading...</p>
        ) : (
          <div>{renderData(_.get(spanish_data, 'lesson_plan'))}</div>
        )}
      </div>
  </>
  )
}

export default App