import fs from 'fs'
import path from 'path'

import React from 'react'

export const getClientScripts = clients => {
  return clients.reduce((acc, client) => {
    const manifest = JSON.parse(fs.readFileSync(client.manifest))
    return [ ...acc,
      ...Object.keys(manifest)
        .filter(key => /\.js$/.test(key))
        .map(key => ({
          isModule: client.module,
          src: manifest[key],
        }))
      ]
  }, [])
}

export const toScriptTags = (noModule, { isModule, src }, key) => {
  if (isModule) {
    return <script key={key} type="module" src={src} />
  } else {
    return <script key={key} noModule={noModule} type="text/javascript" src={src} />
  }
}

export const withClientScripts = clients => WrappedComponent => {
  return (props) => {
    const useNoModuleAttribute = clients.find(client=>client.module)
    const scripts = getClientScripts(clients).map(toScriptTags.bind(null, useNoModuleAttribute))

    return (
      <WrappedComponent scripts={scripts} {...props} />
    )
  }
}

export default withClientScripts
