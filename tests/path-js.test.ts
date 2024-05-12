import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import Path, { PathJSError } from '../src/index.js'

const cwd = process.cwd()
describe('PathJS Main Functions', () => {
  test('Should initiate PathJS from a existing file correctly', () => {
    const packageJSON = new Path('./package.json')
    const json = packageJSON.toJSON()
    expect(packageJSON.path).toBe(resolve(cwd, 'package.json'))
    expect(json.exists).toBe(true)
    expect(packageJSON.type()).toBe('file')
    expect(json.root).toBe(resolve(cwd))
    expect(json.name).toBe('package')
    expect(json.fullname).toBe('package.json')
    expect(json.ext).toBe('.json')
  })

  test('Should initiate PathJS from a existing directory correctly', () => {
    const processCwd = new Path('./')
    const json = processCwd.toJSON()
    expect(processCwd.path).toBe(resolve(cwd))
    expect(json.exists).toBe(true)
    expect(processCwd.type()).toBe('directory')
    expect(json.root).toBe(resolve(cwd, '../'))
    expect(json.name).toBe('path-js')
    expect(json.fullname).toBe('path-js')
    expect(json.ext).toBe('')
  })

  test('Should initiate PathJS from a non-existing file', () => {
    const packageJSON = new Path('./package.json2')
    const json = packageJSON.toJSON()
    expect(packageJSON.path).toBe(resolve(cwd, 'package.json2'))
    expect(json.exists).toBe(false)
    expect(() => packageJSON.strictType()).toThrow(PathJSError)
    expect(json.type).toBe('file')
    expect(json.root).toBe(resolve(cwd))
    expect(json.name).toBe('package')
    expect(json.fullname).toBe('package.json2')
    expect(json.ext).toBe('.json2')
  })
})
