import { once } from 'node:events'
import { WriteStream, copyFileSync, createWriteStream, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { type FileHandle, copyFile, mkdir, open, readFile, readdir, rename, rm, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, isAbsolute, resolve } from 'node:path'
import { Stream } from 'node:stream'
import { PathJSError } from './errors.js'

// #region Types

export type PathTypeValues = 'file' | 'directory'

export interface PathJSONRepresentation {
  /**
   * The working path of the class instance.
   */
  path: string
  /**
   * A boolean value that tells if the file/directory exists.
   */
  exists: boolean
  /**
   * The root directory of the file/directory where the path evaluates to.
   */
  root: string
  /**
   * The name of the file/directory with extension (if any).
   */
  fullname: string
  /**
   * The name of the file/directory (without the extension).
   */
  name: string
  /**
   * The extension of the file, returns an empty string if the
   * provided path evalutes to a directory.
   */
  ext: string
  /**
   * The type of the path.
   */
  type: PathTypeValues
}

export type BufferEncodingOrNull = BufferEncoding | null | undefined

export type ReadFileReturnType<RT extends BufferEncodingOrNull> = RT extends BufferEncoding ? string : RT extends null | undefined ? Buffer : string | Buffer

export type FileAsyncWriteDataTypes = string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream
export type FileSyncWriteDataTypes = string | NodeJS.ArrayBufferView

/**
 * Types that can be converted using `Path.stringToPath()` static method.
 */
export type StringOrPath = string | Path

export interface FileWriteStreamReturnObject {
  /**
   * The writeable stream of the file.
   */
  stream: WriteStream
  /**
   * A `Promise` that will only be fullfilled when calling `stream.end()`.
   */
  once: Promise<unknown[]>
}

/**
 * A path utility suite that gathers several functions
 * related to a specific path.
 * - - - -
 * @see [PathJS GitHub Repository](https://github.com/ruggeryiury/path-js).
 */
export default class Path {
  /**
   * The working path of this class instance.
   */
  readonly path: string
  /**
   * The root directory of the file/directory where the path evaluates to.
   */
  readonly root: string
  /**
   * The name of the file/directory with extension (if any).
   */
  readonly fullname: string
  /**
   * The name of the file/directory (without the extension).
   */
  readonly name: string
  /**
   * The extension of the file, returns an empty string if the
   * provided path evalutes to a directory.
   */
  readonly ext: string

  // #region Constructor

  /**
   * A path utility suite that gathers several functions
   * related to a specific path.
   *
   * Relative paths are accepted and they'll be resolved from
   * the current working directory (using `process.cwd()`).
   * - - - -
   * @param {(Path | string)[]} paths The paths to be evaluated. You can't use two or more `Path` class,
   * and the Path class argument must be the first one, since it's not evaluated to a relative path.
   *
   * Not following this rule will result on a `PathJSError`.
   * @returns {Path} A new instantiated `Path` class.
   * @see [PathJS GitHub Repository](https://github.com/ruggeryiury/path-js).
   * @throws {PathJSError} if two or more `Path` class are used as argument, or the used Path class is the
   * first argument of the constructor.
   */
  constructor(...paths: (Path | string)[]) {
    const allPaths: string[] = []
    let hasPathClass = false
    let pathIndex = 0
    for (const path of paths) {
      if (path instanceof Path) {
        if (hasPathClass) throw new PathJSError("Two or more Path classes can't be used as a Path constructor argument")
        hasPathClass = true
        if (pathIndex !== 0) throw new PathJSError('The given Path class argument is not the first argument.')
        pathIndex++
        allPaths.push(path.path)
        continue
      }

      allPaths.push(path)
      pathIndex++
      continue
    }
    this.path = resolve(...allPaths)
    this.root = dirname(this.path)
    this.fullname = basename(this.path)
    this.name = basename(this.path, extname(this.path))
    this.ext = extname(this.path)
  }

  // #region Static Methods

  /**
   * A static path resolver method.
   * - - - -
   * @param {string[]} paths The paths to be resolved.
   * @returns {string} A string representing a resolved path from given arguments.
   */
  static resolve(...paths: string[]): string {
    return resolve(...paths)
  }

  /**
   * Checks if a random string is a path that resolves to a file/directory.
   * - - - -
   * @param {string[]} paths The paths to want to evaluate.
   * @returns {boolean} A boolean value that tells if the provided string is a path that resolves to a file/directory.
   */
  static isPath(...paths: string[]): boolean {
    return existsSync(resolve(...paths))
  }
  /**
   * Utility function that evaluates path-like variables to an instantiated `Path` class.
   * - - - -
   * @param {StringOrPath} path Any path as string or an instantiated `Path` class.
   * @returns {Path} An instantiated `Path` class.
   */
  static stringToPath(path: StringOrPath): Path {
    if (path instanceof Path) return path
    else return new Path(path)
  }

  // #region Private Methods

  /**
   * Checks if a path resolves to an existing file/directory.
   * - - - -
   * @param {string} operator The function name that calls this checker.
   * @param {PathTypeValues | undefined} checkExistenceAs Tells which type to check.
   * @returns {boolean} Always returns `true`, meaning the file/directory exists.
   * @throws {PathJSError} When the path doesn't resolves to an existing file/directory.
   */
  private checkExistence(operator: string, checkExistenceAs?: PathTypeValues): boolean {
    if (!this.exists()) throw new PathJSError(`Provided path "${this.path}" does not exist to perform Path.${operator}() operation. Please, provide a path that resolves to an actual ${checkExistenceAs ?? 'file or directory'}.`)
    return true
  }

  /**
   * Checks if the provided path resolves to an existing file.
   * - - - -
   * @param {string} operator The function name that calls this checker.
   * @returns {boolean} Always returns `true`, meaning the provided path is a file.
   * @throws {PathJSError} When the path doesn't resolves to an existing file.
   */
  private checkAsFile(operator: string): boolean {
    if (!lstatSync(this.path).isFile()) throw new PathJSError(`Provided path "${this.path}" is not a file to perform file operation Path.${operator}()"`)
    return true
  }

  /**
   * Checks if the provided path resolves to an existing directory.
   * - - - -
   * @param {string} operator The function name that calls this checker.
   * @returns {boolean} Always returns `true`, meaning the provided path is a directory.
   * @throws {PathJSError} When the path doesn't resolves to an existing directory.
   */
  private checkAsDirectory(operator: string): boolean {
    if (!lstatSync(this.path).isDirectory()) throw new PathJSError(`Provided path "${this.path}" is not a directory to perform directory operation Path.${operator}()"`)
    return true
  }

  // #region Main Methods

  /**
   * Synchronously checks if the path resolves to an existing file/directory.
   * - - - -
   * @returns {boolean} A boolean value that tells if the file/directory exists.
   */
  exists(): boolean {
    return existsSync(this.path)
  }

  /**
   * Synchronously checks the type (file or directory) of the path.
   *
   * If the path resolves to an existing file/directory, it will check from
   * the actual file/directory, otherwise it'll check based on the instantiated path
   * extension.
   *
   * _**NOTE**: Checking the file by the path's extension may give you wrong results
   * on special cases (eg. when checking the type of a file without extension, which
   * results to a directory)._
   * - - - -
   * @returns {PathTypeValues} A string that tells the type of the path.
   */
  type(): PathTypeValues {
    try {
      this.checkExistence('type')
      return lstatSync(this.path).isFile() ? 'file' : 'directory'
    } catch (err) {
      if (this.ext) return 'file'
      return 'directory'
    }
  }

  /**
   * A more strict version of the `Path.type()` method, throwing an `PathJSError` if
   * the path doesn't resolve to a file/directory.
   * - - - -
   * @returns {PathTypeValues} A string that tells the type of the path.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing file/directory.
   */
  strictType(): PathTypeValues {
    this.checkExistence('type')
    return lstatSync(this.path).isFile() ? 'file' : 'directory'
  }

  // #region Path Type Checkers

  /**
   * Checks if the instantiated class path resolves to a file.
   * - - - -
   * @returns {boolean} A boolean value that evaluates if the instantiated class path resolves to a file.
   */
  isFilePath(): boolean {
    return this.type() === 'file'
  }

  /**
   * Checks if the instantiated class path resolves to a directory.
   * - - - -
   * @returns {boolean} A boolean value that evaluates if the instantiated class path resolves to a directory.
   */
  isDirPath(): boolean {
    return this.type() === 'directory'
  }

  // #region Path Editors

  /**
   * Returns a resolved path based on the instantiated class path and its type.
   *
   * The path can be both absolute or a relative path. Relative paths behave
   * differently based on the `path.type()` method:
   * - If the instantiated class path resolves to a `file`, the provided relative path will be resolved
   * **from this file root directory**.
   * - If the instantiated class path resolves to a `directory`, the provided relative path will be
   * resolved **from this directory itself**.
   * - - - -
   * @param {string[]} paths The new path to be resolved.
   * @returns {string} The new resolved path as string.
   */
  resolve(...paths: string[]): string {
    if (isAbsolute(paths[0])) return resolve(...paths)
    else {
      if (this.isDirPath()) {
        return resolve(this.path, ...paths)
      }
      return resolve(this.root, ...paths)
    }
  }

  /**
   * Returns a new path with changed file name and extension.
   * - - - -
   * @param {string | null} newFileName The new file name.
   * @param {string | undefined} newFileExt `OPTIONAL` The new file extension.
   * @returns {string} The new changed path as string.
   * @throws {PathJSError} If the instantiated class path type is not a file.
   */
  changeFileName(newFileName: string | null, newFileExt?: string): string {
    if (this.isDirPath()) throw new PathJSError(`Provided path "${this.path}" is not a file to execute Path.changeFileName() operation.`)
    return resolve(this.root, `${newFileName ?? this.name}.${newFileExt?.startsWith('.') ? newFileExt.slice(1) : newFileExt ?? this.ext.slice(1)}`)
  }

  /**
   * Returns a new path with changed file extension.
   * - - - -
   * @param {string} newFileExt The new file extension.
   * @returns {string} The new changed path as string.
   * @throws {PathJSError} If the instantiated class path type is not a file.
   */
  changeFileExt(newFileExt: string): string {
    if (this.isDirPath()) throw new PathJSError(`Provided path "${this.path}" is not a file to execute Path.changeFileName() operation.`)
    return resolve(this.root, `${this.name}.${newFileExt.startsWith('.') ? newFileExt.slice(1) : newFileExt}`)
  }

  /**
   * Returns a new path with changed directory name.
   * - - - -
   * @param {string} newDirName The new directory name.
   * @returns {string} The new changed path as string.
   * @throws {PathJSError} If the instantiated class path type is not a directory.
   */
  changeDirName(newDirName: string): string {
    if (this.isFilePath()) throw new PathJSError(`Provided path "${this.path}" is not a directory to execute Path.changeDirName() operation.`)
    return resolve(this.root, newDirName)
  }

  // #region Class Converters

  /**
   * Returns an object with all properties from this `Path` class instance.
   * - - - -
   * @returns {PathJSONRepresentation} An object with all properties from this `Path` class instance.
   */
  toJSON(): PathJSONRepresentation {
    return {
      path: this.path,
      exists: this.exists(),
      type: this.type(),
      root: this.root,
      name: this.name,
      fullname: this.fullname,
      ext: this.ext,
    }
  }

  /**
   * Returns a stringified JSON representation of this `Path` class instance.
   * - - - -
   * @param {(string | number)[] | null | undefined} replacer `OPTIONAL` An array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
   * @param {number} space `OPTIONAL` Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
   * @returns {string} A stringified JSON representation of this `Path` class instance.
   */
  toString(replacer?: (string | number)[] | null, space = 0): string {
    return JSON.stringify(this.toJSON(), replacer, space)
  }

  // #region File Methods

  /**
   * #### File method:
   * Asynchronously opens a file handler.
   * - - - -
   * @param {string | number | undefined} flags `OPTIONAL` The file system flag. See the supported flags [here](https://nodejs.org/api/fs.html#file-system-flags). Default is `'r'` (Read).
   * @returns {Promise<FileHandle>} The file handler of the class instantiated path.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing file.
   */
  async openFile(flags?: string | number): Promise<FileHandle> {
    this.checkExistence('openFile', 'file')
    this.checkAsFile('openFile')
    return await open(this.path, flags)
  }

  /**
   * #### File method:
   * Asynchronously reads a file contents.
   * - - - -
   * @param {RT} encoding `OPTIONAL` The encoding of the file. If `undefined`, it will be returned as a `Buffer`.
   * @returns {Promise<ReadFileReturnType<RT>>} The contents of the file.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing file.
   */
  async readFile<RT extends BufferEncodingOrNull = undefined>(encoding?: RT): Promise<ReadFileReturnType<RT>> {
    this.checkExistence('readFile', 'file')
    this.checkAsFile('readFile')
    return (await readFile(this.path, encoding)) as ReadFileReturnType<RT>
  }

  /**
   * #### File method:
   * Synchronously reads a file contents.
   * - - - -
   * @param {RT} encoding `OPTIONAL` The encoding of the file. If `undefined`, it will be returned as a `Buffer`.
   * @returns {ReadFileReturnType<RT>} The contents of the file.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing file.
   */
  readFileSync<RT extends BufferEncodingOrNull = undefined>(encoding?: RT): ReadFileReturnType<RT> {
    this.checkExistence('readFileSync', 'file')
    this.checkAsFile('readFileSync')
    return readFileSync(this.path, encoding) as ReadFileReturnType<RT>
  }

  /**
   * #### File method:
   * Asynchronously reads a JSON file and automatically parses the JSON file to JavaScript Object.
   * - - - -
   * @param {BufferEncoding | undefined} encoding `OPTIONAL` The encoding of the file. Default is `'utf-8'`.
   * @returns {Promise<T>} The parsed JSON file as JavaScript object.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing file.
   * @throws {PathJSError} If there's any known error on the parsing process.
   */
  async readJSONFile<T>(encoding: BufferEncoding = 'utf-8'): Promise<T> {
    const contents = await readFile(this.path, encoding)
    try {
      return JSON.parse(Buffer.isBuffer(contents) ? contents.toString(encoding) : contents) as T
    } catch (err) {
      if (err instanceof Error) throw new PathJSError(err.message)
      else throw err
    }
  }

  /**
   * #### File method:
   * Synchronously reads a JSON file and automatically parses the JSON file to JavaScript Object.
   * - - - -
   * @param {BufferEncoding | undefined} encoding `OPTIONAL` The encoding of the file. Default is `'utf-8'`.
   * @returns {Promise<T>} The parsed JSON file as JavaScript object.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing file.
   * @throws {PathJSError} If there's any known error on the parsing process.
   */
  readJSONFileSync<T>(encoding: BufferEncoding = 'utf-8'): T {
    const contents = readFileSync(this.path, encoding)
    try {
      return JSON.parse(Buffer.isBuffer(contents) ? contents.toString(encoding) : contents) as T
    } catch (err) {
      if (err instanceof Error) throw new PathJSError(err.message)
      else throw err
    }
  }

  /**
   * #### File method:
   * Asynchronously creates a new file with provided data and returns the created file path.
   * - - - -
   * @param {FileAsyncWriteDataTypes} data The content you want to write.
   * @param {BufferEncodingOrNull} encoding `OPTIONAL` The encoding of the content.
   * @returns {Promise<string>} The path of the actual created file.
   * @throws {Error} If an error occurs on the file writing process.
   */
  async writeFile(data: FileAsyncWriteDataTypes, encoding?: BufferEncodingOrNull): Promise<string> {
    if (this.exists()) await this.deleteFile()
    await writeFile(this.path, data, encoding)
    return this.path
  }

  /**
   * #### File method:
   * Synchronously creates a new file with provided data and returns the created file path.
   * - - - -
   * @param {FileSyncWriteDataTypes} data The content you want to write.
   * @param {BufferEncodingOrNull} encoding `OPTIONAL` The encoding of the content.
   * @returns {string} The path of the actual created file.
   * @throws {Error} If an error occurs on the file writing process.
   */
  writeFileSync(data: FileSyncWriteDataTypes, encoding?: BufferEncodingOrNull): string {
    if (this.exists()) this.deleteFileSync()
    writeFileSync(this.path, data, encoding)
    return this.path
  }

  /**
   * #### File method:
   * Asynchronously deletes the file resolved on the class instance path.
   * - - - -
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing file.
   */
  async deleteFile(): Promise<void> {
    this.checkExistence('deleteFile', 'file')
    this.checkAsFile('deleteFile')
    await unlink(this.path)
  }
  /**
   * #### File method:
   * Synchronously deletes the file resolved on the class instance path.
   * - - - -
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing file.
   */
  deleteFileSync(): void {
    this.checkExistence('deleteFileSync', 'file')
    this.checkAsFile('deleteFileSync')
    unlinkSync(this.path)
  }

  /**
   * #### File method:
   * Asynchronously checks if the file exists and delete it.
   * - - - -
   * @throws {PathJSError} If the instantiated class path type is not a file.
   */
  async checkThenDeleteFile(): Promise<void> {
    if (this.isDirPath()) throw new PathJSError(`Provided path "${this.path}" is not a file to execute Path.checkThenDeleteFile() operation.`)
    if (this.exists()) await this.deleteFile()
  }

  /**
   * #### File method:
   * Synchronously checks if the file exists and delete it.
   * - - - -
   * @throws {PathJSError} If the instantiated class path type is not a file.
   */
  checkThenDeleteFileSync(): void {
    if (this.isDirPath()) throw new PathJSError(`Provided path "${this.path}" is not a file to execute Path.checkThenDeleteFileSync() operation.`)
    if (this.exists()) this.deleteFileSync()
  }

  /**
   * #### File method:
   * Asychronously rename/move a file based on a provided new path and returns the new path.
   *
   * Both absolute and relative paths are accepted. Relative paths will resolve
   * from the class instantiated path root directory.
   * - - - -
   * @param {string} newPath The new location of the file.
   * @returns {Promise<string>} The new path of the renamed/moved file as string.
   * @throws {PathJSError} If the provided new path location resolves to an already existing file.
   */
  async renameFile(newPath: string): Promise<string> {
    this.checkExistence('renameFile', 'file')
    this.checkAsFile('renameFile')
    const newPathIsAbs = isAbsolute(newPath)
    const nPath = new Path(newPathIsAbs ? newPath : resolve(dirname(this.path), newPath))
    if (nPath.exists()) throw new PathJSError(`Provided path ${newPathIsAbs ? `"${nPath.path}"` : `(resolved to "${nPath.path}")`} already exists. Please, choose another file name.`)
    await rename(this.path, nPath.path)
    return nPath.path
  }

  /**
   * #### File method:
   * Sychronously rename/move a file based on a provided new path and returns the new path.
   *
   * Both absolute and relative paths are accepted. Relative paths will resolve
   * from the class instantiated path root directory.
   * - - - -
   * @param {string} newPath The new location of the file.
   * @returns {string} The new path of the renamed/moved file as string.
   * @throws {PathJSError} If the provided new path location resolves to an already existing file.
   */
  renameFileSync(newPath: string): string {
    this.checkExistence('renameFileSync', 'file')
    this.checkAsFile('renameFileSync')
    const newPathIsAbs = isAbsolute(newPath)
    const nPath = new Path(newPathIsAbs ? newPath : resolve(dirname(this.path), newPath))
    if (nPath.exists()) throw new PathJSError(`Provided path ${newPathIsAbs ? `"${nPath.path}"` : `(resolved to "${nPath.path}")`} already exists. Please, choose another file name.`)
    renameSync(this.path, nPath.path)
    return nPath.path
  }

  /**
   * #### File method:
   * Asychronously copies a file to the provided new path and returns the new path.
   * - - - -
   * @param {string} destPath The new location where you want to copy the file to.
   * @returns {Promise<string>} The path where the file was copied.
   * @throws {PathJSError} If the provided new path location resolves to an already existing file.
   */
  async copyFile(destPath: string): Promise<string> {
    this.checkExistence('copyFile', 'file')
    this.checkAsFile('copyFile')
    const destPathIsAbs = isAbsolute(destPath)
    const dPath = new Path(destPathIsAbs ? destPath : resolve(dirname(this.path), destPath))
    if (dPath.exists()) throw new PathJSError(`Provided path ${destPathIsAbs ? `"${dPath.path}"` : `(resolved to "${dPath.path}")`} already exists. Please, choose another file name.`)
    await copyFile(this.path, dPath.path)
    return dPath.path
  }

  /**
   * #### File method:
   * Sychronously copies a file to the provided new path and returns the new path.
   * - - - -
   * @param {string} destPath The new location where you want to copy the file to.
   * @returns {Promise<string>} The path where the file was copied.
   * @throws {PathJSError} If the provided new path location resolves to an already existing file.
   */
  copyFileSync(destPath: string): string {
    this.checkExistence('copyFile', 'file')
    this.checkAsFile('copyFile')
    const destPathIsAbs = isAbsolute(destPath)
    const dPath = new Path(destPathIsAbs ? destPath : resolve(dirname(this.path), destPath))
    if (dPath.exists()) throw new PathJSError(`Provided path ${destPathIsAbs ? `"${dPath.path}"` : `(resolved to "${dPath.path}")`} already exists. Please, choose another file name.`)
    copyFileSync(this.path, dPath.path)
    return dPath.path
  }

  /**
   * #### File method:
   * Asynchronously creates a file write stream and returns an object with two values.
   *
   * - `stream`: The actual file write stream.
   * - `once`: A promise that will be resolved when you close the file write stream.
   * - - - -
   * @returns {Promise<FileWriteStreamReturnObject>} An object with the file writeable stream and a promise
   * that will be fullfilled when the writeable stream is closed.
   * @throws {PathJSError} If the class instance path doesn't resolve to a file.
   */
  async createFileWriteStream(): Promise<FileWriteStreamReturnObject> {
    if (this.exists()) await this.deleteFile()
    const stream = createWriteStream(this.path)
    return {
      stream,
      once: once(stream, 'finish'),
    }
  }

  /**
   * #### File method:
   * Asynchronously opens the file resolved from the class instance path, reads
   * only the bytes after the specified offset, closes it and returns as a `Buffer`.
   * - - - -
   * @param {number} byteOffset The offset start where the file will be read.
   * @param {number} byteLength `OPTIONAL` The length of the bytes to want to be read.
   * If `undefined`, it will read the entire file, starting from the provided offset.
   * @returns {Promise<Buffer>} A Buffer with the read bytes, from the provided offset and
   * with the provided length.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing file.
   */
  async readFileOffset(byteOffset: number, byteLength?: number): Promise<Buffer> {
    this.checkAsFile('readFileOffset')

    let buffer: Buffer
    if (byteLength !== undefined) {
      const fileOpen = await open(this.path, 'r')
      buffer = Buffer.alloc(byteLength)
      await fileOpen.read(buffer, 0, byteLength, byteOffset)
      await fileOpen.close()
      return buffer
    }

    const fileBuffer = await readFile(this.path)
    return fileBuffer.subarray(byteOffset)
  }

  // #region Directory Methods

  /**
   * #### Directory method:
   * Asynchronously creates a file inside the class instance directory path and returns the
   * created file path.
   * - - - -
   * @param {string} filename The name of the new file to be created.
   * @param {FileAsyncWriteDataTypes | null} data `OPTIONAL` The content of the new file to be created.
   * @param {BufferEncodingOrNull} encoding `OPTIONAL` The encoding of the content.
   * @returns {Promise<string>} The path of the new file as string.
   * @throws {PathJSError} If the provided file already exists.
   */
  async createFileOnDir(filename: string, data?: FileAsyncWriteDataTypes | null, encoding?: BufferEncodingOrNull): Promise<string> {
    this.checkExistence('touch', 'directory')
    this.checkAsDirectory('touch')
    const newFilePath = resolve(this.path, filename)
    if (existsSync(newFilePath)) throw new PathJSError(`File on path "${newFilePath}" already exists.`)
    await writeFile(newFilePath, data ?? '', encoding)
    return newFilePath
  }

  /**
   * #### Directory method:
   * Synchronously creates a file inside the class instance directory path and returns the
   * created file path.
   * - - - -
   * @param {string} filename The name of the new file to be created.
   * @param {FileSyncWriteDataTypes | null} data `OPTIONAL` The content of the new file to be created.
   * @param {BufferEncodingOrNull} encoding `OPTIONAL` The encoding of the content.
   * @returns {string} The path of the new file as string.
   * @throws {PathJSError} If the provided file already exists.
   */
  createFileOnDirSync(filename: string, data?: FileSyncWriteDataTypes | null, encoding?: BufferEncodingOrNull): string {
    this.checkExistence('touch', 'directory')
    this.checkAsDirectory('touch')
    const newFilePath = resolve(this.path, filename)
    if (existsSync(newFilePath)) throw new PathJSError(`File on path "${newFilePath}" already exists.`)
    writeFileSync(newFilePath, data ?? '', encoding)
    return newFilePath
  }

  /**
   * #### Directory method:
   * Asynchronously reads all directory files and returns their paths on an `Array`.
   * - - - -
   * @param {boolean} asAbsolutePaths `OPTIONAL` If `true`, the path of all files from the folder
   * will be absolute paths rather than just the file/directory names. Default is `false`.
   * @returns {Promise<string[]>} An array with the name of all files and directories from
   * the provided directory path.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing directory.
   */
  async readDir(asAbsolutePaths?: boolean): Promise<string[]> {
    this.checkExistence('readDir', 'directory')
    this.checkAsDirectory('readDir')
    if (asAbsolutePaths) return (await readdir(this.path)).map((path) => resolve(this.path, path))
    else return await readdir(this.path)
  }

  /**
   * #### Directory method:
   * Synchronously reads all directory files and returns their paths on an `Array`.
   * - - - -
   * @param {boolean} asAbsolutePaths `OPTIONAL` If `true`, the path of all files from the folder
   * will be absolute paths rather than just the file/directory names. Default is `false`.
   * @returns {string[]} An array with the name of all files and directories from
   * the provided directory path.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing directory.
   */
  readDirSync(asAbsolutePaths?: boolean): string[] {
    this.checkExistence('readDir', 'directory')
    this.checkAsDirectory('readDir')
    if (asAbsolutePaths) return readdirSync(this.path).map((path) => resolve(this.path, path))
    else return readdirSync(this.path)
  }

  /**
   * #### Directory method:
   * Asynchronously creates a directory and returns the created directory path.
   * - - - -
   * @param {boolean | undefined} recursive `OPTIONAL` Indicates whether parent folders should be created.
   * If a folder was created, the path to the first created folder will be returned. Default is `false`.
   * @returns {Promise<string>} The created directory path.
   * @throws {PathJSError} If the class instance path resolves to an existing directory.
   */
  async mkDir(recursive = false): Promise<string> {
    if (this.exists()) throw new PathJSError(`Directory on path "${this.path}" already exists.`)
    await mkdir(this.path, { recursive })
    return this.path
  }

  /**
   * #### Directory method:
   * Synchronously creates a directory and returns the created directory path.
   * - - - -
   * @param {boolean | undefined} recursive `OPTIONAL` Indicates whether parent folders should be created.
   * If a folder was created, the path to the first created folder will be returned. Default is `false`.
   * @returns {string} The created directory path.
   * @throws {PathJSError} If the class instance path resolves to an existing directory.
   */
  mkDirSync(recursive = false): string {
    if (this.exists()) throw new PathJSError(`Directory on path "${this.path}" already exists.`)
    mkdirSync(this.path, { recursive })
    return this.path
  }

  /**
   * #### Directory method:
   * Asynchronously deletes a directory and all its contents.
   * - - - -
   * @param {boolean | undefined} recursive `OPTIONAL` If `true`, perform a recursive directory removal. In recursive mode, operations are retried on failure. Default is `true`.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing directory.
   */
  async deleteDir(recursive = true): Promise<void> {
    this.checkExistence('rmDir', 'directory')
    this.checkAsDirectory('rmDir')
    await rm(this.path, { recursive })
  }

  /**
   * #### Directory method:
   * Synchronously deletes a directory and all its contents.
   * - - - -
   * @param {boolean | undefined} recursive `OPTIONAL` If `true`, perform a recursive directory removal. In recursive mode, operations are retried on failure. Default is `true`.
   * @throws {PathJSError} If the class instance path doesn't resolve to an existing directory.
   */
  deleteDirSync(recursive = true): void {
    this.checkExistence('rmDir', 'directory')
    this.checkAsDirectory('rmDir')
    rmSync(this.path, { recursive })
  }
}

export { PathJSError } from './errors.js'
