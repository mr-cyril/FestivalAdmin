import path from 'path'

import base from './client.base'

describe('client base', () => {

  it('targets the web', () => {
    expect(base.get('target')).toEqual('web')
  })

  describe('entry point', () => {

    it('includes the client app', () => {
      expect(base.entry('bundle').values()).toContain(path.resolve(process.cwd(), 'src/client/index.js'))
    })

  })

  describe('output', () => {

    it('outputs to the build directory', () => {
      expect(base.output.get('path')).toEqual(path.resolve(process.cwd(), 'build'))
    })

    it('specifies the output filename', () => {
      expect(base.output.get('filename')).toEqual('client.bundle.js')
    })

    it('specifies the public path', () => {
      expect(base.output.get('publicPath')).toEqual('/static/')
    })

    it('specifies the format for chunked output', () => {
      expect(base.output.get('chunkFilename')).toEqual('[name].[chunkhash:8].chunk.js')
    })

  })

  describe('babel loader', () => {

    let rule

    beforeEach(() => {
      rule = base.module.rule('compile')
    })

    it('has a babel rule', () => {
      expect(rule).toBeDefined()
    })

    it('applies to js and jsx files', () => {
      expect(rule.get('test').test('file.js')).toBeTruthy()
      expect(rule.get('test').test('file.jsx')).toBeTruthy()
    })

    describe('babel loader', () => {

      let loader

      beforeEach(() => {
        loader = rule.use('babel').loader('babel-loader')
      })

      it('has a babel loader', () => {
        expect(loader).toBeDefined()
      })

      describe('@babel/preset-env', () => {

        let preset

        beforeEach(() => {
          preset = loader.get('options').presets.find(preset => preset[0] === '@babel/preset-env')
        })

        it('uses @babel/preset-env', () => {
          expect(preset).toBeDefined()
        })

        it('uses built in polyfills', () => {
          expect(preset[1].useBuiltIns).toBe('usage')
        })

        it('specifies the core-js version', () => {
          expect(preset[1].corejs).toBe('3.0.1')
        })

        it('disables module transforms', () => {
          expect(preset[1].modules).toBe(false)
        })

      })

      describe('@babel/preset-react', () => {

        let preset

        beforeEach(() => {
          preset = loader.get('options').presets.find(preset => {
            const name = Array.isArray(preset) ? preset[0] : preset
            return name === '@babel/preset-react'
          })
        })

        it('uses @babel/preset-react', () => {
          expect(preset).toBeDefined()
        })

      })

      describe('babel-plugin-styled-components', () => {

        let plugin

        beforeEach(() => {
          plugin = loader.get('options').plugins.find(plugin => {
            const name = Array.isArray(plugin) ? plugin[0] : plugin
            return name === 'babel-plugin-styled-components'
          })
        })

        it('uses styled-components plugin', () => {
          expect(plugin).toBeDefined()
        })

        it('supports SSR', () => {
          expect(plugin[1].ssr).toBe(true)
        })

        it('modifies component display name', () => {
          expect(plugin[1].displayName).toBe(true)
        })

        it('should minify output', () => {
          expect(plugin[1].minify).toBe(true)
        })

        it('should transpile template literals', () => {
          expect(plugin[1].transpileTemplateLiterals).toBe(true)
        })
      })
    })
  })

  describe('manifest', () => {

    let plugin

    beforeEach(() => {
      plugin = base.plugin('manifest')
    })

    it('creates a build manifest', () => {
      expect(plugin).toBeDefined()
      expect(plugin.values()[1].name).toBe('ManifestPlugin')
    })

  })
})