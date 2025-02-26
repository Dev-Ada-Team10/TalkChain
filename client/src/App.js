import React, { useState, useEffect } from 'react'

function App() {

  const [data, setData] = useState([{}])

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

  return (
    <div>

        {(typeof data.languages === 'undefined') ? (
          <p>Loading...</p>
        ) : (
            data.languages.map((language, i) => (
                <p key={i}>{language}</p>
            ))

        )}

    </div>
  )
}

export default App