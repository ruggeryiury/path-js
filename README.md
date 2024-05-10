<div align=center>
<img src='https://raw.githubusercontent.com/ruggeryiury/path-js/main/assets/header.webp' alt='Path-JS: Package Header Image'>
</div>

<div align=center>
<img src='https://xesque.rocketseat.dev/platform/tech/javascript.svg' width='36px' title='JavaScript'/> 
<img src='https://xesque.rocketseat.dev/platform/tech/typescript.svg' width='36px' title='TypeScript'/>
</div>

<div align=center>
<img src='https://img.shields.io/github/last-commit/ruggeryiury/path-js?color=%23DDD&style=for-the-badge' /> <img src='https://img.shields.io/github/repo-size/ruggeryiury/path-js?style=for-the-badge' /> <img src='https://img.shields.io/github/issues/ruggeryiury/path-js?style=for-the-badge' /> <img src='https://img.shields.io/github/package-json/v/ruggeryiury/path-js?style=for-the-badge' /> <img src='https://img.shields.io/github/license/ruggeryiury/path-js?style=for-the-badge' />
</div>

- [About](#about)
- [Usage](#usage)
- [API](#api)
  - [`Path.exists()`](#pathexists)
  - [`Path.type()`](#pathtype)
  - [`Path.strictType()`](#pathstricttype)
- [Path Type Checkers](#path-type-checkers)
  - [`Path.isFilePath()`](#pathisfilepath)
  - [`Path.isDirPath()`](#pathisdirpath)
- [Path editors](#path-editors)
  - [`Path.resolve()`](#pathresolve)
  - [`Path.changeFileName()`](#pathchangefilename)
  - [`Path.changeFileExt()`](#pathchangefileext)
  - [`Path.changeDirName()`](#pathchangedirname)
- [Class converters](#class-converters)
  - [`Path.toJSON()`](#pathtojson)
  - [`Path.toString()`](#pathtostring)
- [File methods](#file-methods)
  - [`Path.openFile()`](#pathopenfile)
  - [`Path.readFile()`](#pathreadfile)
  - [`Path.writeFile()`](#pathwritefile)
  - [`Path.deleteFile()`](#pathdeletefile)
  - [`Path.checkThenDeleteFile()`](#pathcheckthendeletefile)
  - [`Path.renameFile()`](#pathrenamefile)
  - [`Path.createFileWriteStream()`](#pathcreatefilewritestream)
  - [`Path.readFileOffset()`](#pathreadfileoffset)
  - [`Path.readFileOffsetFromHandler()`](#pathreadfileoffsetfromhandler)
- [Directory methods](#directory-methods)
  - [`Path.createFileOnDir()`](#pathcreatefileondir)
  - [`Path.readDir()`](#pathreaddir)
  - [`Path.mkDir()`](#pathmkdir)
  - [`Path.deleteDir()`](#pathdeletedir)

# About

**_Path-JS_** joins several methods from Node's `fs` and `path` modules in a single class. These methods will work on a path specified on the class constructor, joining methods to manipulate both files and directories.

# Usage

Just call the `Path` class, providing a path and you're ready to go!

```ts
import Path from 'path-js'

const file = 'path/to/file.txt'
const filePath = new Path(file)
```

# API

## `Path.exists()`

Synchronously checks if the path resolves to an existing file/directory.

- Returns: `boolean`

```ts
import Path from 'path-js'

const file = 'path/to/file.txt'
const filePath = new Path(file)
const fileExists = filePath.exists()
console.log(typeof fileExists) // boolean
```

## `Path.type()`

Synchronously checks the type (file or directory) of the path.

If the path resolves to an existing file/directory, it will check from the actual file/directory, otherwise it'll check based on the instantiated path extension.

_**NOTE**: Checking the file by the path's extension may give you wrong results on special cases (eg. when checking the type of a file without extension, which results to a directory)._

```ts
import Path from 'path-js'

const file = 'path/to/file.txt'
const filePath = new Path(file)
const fileType = filePath.type()
console.log(fileType) // 'file'
```

## `Path.strictType()`

A more strict version of the `Path.type()` method, throwing an `PathJSError` if the path doesn't resolve to a file directory.

- Returns: `PathTypeValues`
- Throws: `PathJSError` if the class instance path doesn't resolve to a file/directory.

```ts
import Path from 'path-js'

const file = 'path/to/existing/file.txt'
const filePath = new Path(file)
const fileType = filePath.strictType()
console.log(fileType) // 'file'

const file = 'path/to/non-existing/file.txt'
const filePath = new Path(file)
const fileType = filePath.strictType() // Throws PathJSError
```

# Path Type Checkers

_**Note**: These path type checkers uses the `Path.type()` method to evaluate the path types rather then using `Path.strictType()`, that throws a `PathJSError` if the file/directory doesn't exist._

## `Path.isFilePath()`

Checks if the instantiated class path resolves to a file.

- Returns: `boolean`

```ts
import Path from 'path-js'

const file = 'path/to/file.txt'
const filePath = new Path(file)
const isFilePath = filePath.isFilePath()
console.log(isFilePath) // true
```

## `Path.isDirPath()`

Checks if the instantiated class path resolves to a directory.

- Returns: `boolean`
-

```ts
import Path from 'path-js'

const dir = 'path/to/directory'
const dirPath = new Path(dir)
const isDirPath = filePath.isDirPath()
console.log(isDirPath) // true
```

# Path editors

## `Path.resolve()`

Returns a resolved path based on the instantiated class path and its type.

The path can be both absolute or a relative path. Relative paths behave differently based on the `path.type()` method:

- If the instantiated class path resolves to a `file`, the provided relative path will be resolved **from this file root directory**.
- If the instantiated class path resolves to a `directory`, the provided relative path will be resolved **from this directory itself**.

- Parameters:
  - **newPath** `string`: The new path to be resolved
- Returns: `string`

```ts
import Path from 'path-js'

// Resolving file paths
const file = 'path/to/file.txt'
const filePath = new Path(file)
const newFilePath = filePath.resolve('./other-file.txt')
console.log(newFilePath) // 'path/to/other-file.txt'

// Resolving diirectory paths
const dir = 'path/to/directory'
const dirPath = new Path(file)
const newDirPath = filePath.resolve('../')
console.log(newDirPath) // 'path/to'
```

## `Path.changeFileName()`

Returns a new path with changed file name and extension.

- Parameters:
  - **newFileName** `string | null`: The new file name.
  - **newFileExt**_?_ `string | undefined`: `OPTIONAL` The new file extension.
- Returns: `string`
- Throws: `PathJSError` if the instantiated class path type is not a file.

```ts
import Path from 'path-js'

// Resolving file paths
const file = 'path/to/file.txt'
const filePath = new Path(file)
const newFilePath = filePath.changeFileName('other-file', 'bin')
console.log(newFilePath) // 'path/to/other-file.bin'
```

## `Path.changeFileExt()`

Returns a new path with changed file extension.

- Parameters:
  - **newFileExt** `string`: The new file extension.
- Returns: `string`
- Throws: `PathJSError` if the instantiated class path type is not a file.

```ts
import Path from 'path-js'

// Resolving file paths
const file = 'path/to/file.txt'
const filePath = new Path(file)
const newFilePath = filePath.changeFileExt('bin')
console.log(newFilePath) // 'path/to/file.bin'
```

## `Path.changeDirName()`

Returns a new path with changed directory name.

- Parameters:
  - **newDirName** `string`: The new directory name.
- Returns: `string`
- Throws: `PathJSError` if the instantiated class path type is not a directory.

```ts
import Path from 'path-js'

// Resolving file paths
const dir = 'path/to/directory'
const dirPath = new Path(dir)
const newDirPath = dirPath.changeDirName('bin')
console.log(newDirPath) // 'path/to/bin'
```

# Class converters

## `Path.toJSON()`

Calls all synchronous methods from this class and return all results on an object.

```ts
import Path from 'path-js'

const file = 'path/to/file.txt'
const filePath = new Path(file)
const fileObject = filePath.toJSON()

console.log(fileObject.path) // 'path/to/file.txt'
console.log(typeof fileObject.exists) // boolean
console.log(fileObject.type) // 'file'
console.log(fileObject.root) // 'path/to'
console.log(fileObject.name) // 'file'
console.log(fileObject.fullname) // 'file.txt'
console.log(fileObject.ext) // '.txt'
```

## `Path.toString()`

Returns a stringified JSON representation of this `Path` class instance.

- Parameters:
  - **replacer**_?_ `(string | number)[] | null`: `OPTIONAL` An array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
  - **space**_?_ `number`: `OPTIONAL` Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
- Returns: `string`

```ts
import Path from 'path-js'

const file =
  'C:\\Users\\Ruggery\\Documents\\Visual Studio Code\\js\\path-js\\package.json'
const filePath = new Path(file)
const fileObjectToString = filePath.toString()

console.log(fileObjectToString) // {"path":"C:\\Users\\Ruggery\\Documents\\Visual Studio Code\\js\\path-js\\path\\to\\file.txt","exists":false,"type":"file","root":"C:\\Users\\Ruggery\\Documents\\Visual Studio Code\\js\\path-js\\path\\to","name":"file","fullname":"file.txt","ext":".txt"}
```

# File methods

These methods are meant to manipulate files.

## `Path.openFile()`

Asynchronously opens a file handler.

- Parameters:
  - **flags**_?_ `string | number`: `OPTIONAL` The file system flag. See the supported flags [here](https://nodejs.org/api/fs.html#file-system-flags). Default is `'r'` (Read).
- Returns: `FileHandle`
- Throws: `PathJSError` if the class instance path doesn't resolve to a file.

```ts
import Path from 'path-js'

const file = 'path/to/file.txt'
const filePath = new Path(file)

const fileHandler = await filePath.openFile()

// ...do any FileHandle operation, but remember to close the handler!
fileHandler.close()
```

## `Path.readFile()`

Asynchronously reads a file contents.

- Parameters:
  - **encoding**_?_ `BufferEncodingOrNull`: `OPTIONAL` The encoding of the file. If `undefined`, it will be returned as a `Buffer`.
- Returns:
  - `string`: If you specify an `encoding` argument.
  - `Buffer`: If you don't specify an `encoding` argument.
- Throws: `PathJSError` if the class instance path doesn't resolve to a file.

```ts
import Path from 'path-js'

const file = 'path/to/file.txt'
const filePath = new Path(file)

const fileContentsAsBuffer = await filePath.readFile()
```

## `Path.writeFile()`

Asynchronously creates a new file with provided data and returns the created file path.

- Parameters:
  - **data** `FileWriteDataTypes`: The content you want to write.
  - **encoding**_?_ `BufferEncodingOrNull`: `OPTIONAL` The encoding of the content.
- Returns: `string`
- Throws: `Error` if an error occurs on the file writing process.

```ts
import Path from 'path-js'

const file = 'path/to/file.txt'
const filePath = new Path(file)

const fileNewContents = 'example text'
await filePath.writeFile(fileNewContents, 'utf8')
```

## `Path.deleteFile()`

Asynchronously deletes the file resolved on the class instance path.

- Throws: `PathJSError` if the class instance path doesn't resolve to an existing file.

```ts
import Path from 'path-js'

const file = 'path/to/file_to_be_deleted.txt'
const filePath = new Path(file)
await filePath.unlinkFile()
```

## `Path.checkThenDeleteFile()`

Asynchronously checks if the file exists and delete it.

- Throws: `PathJSError` if the instantiated class path type is not a file.

```ts
import Path from 'path-js'

const file = 'path/to/file_to_be_deleted.txt'
const filePath = new Path(file)

// Using this method...
await filePath.checkThenDeleteFile()

// Is the same thing as doing this:
if (filePath.exists()) await filePath.deleteFile()
```

## `Path.renameFile()`

Asychronously rename/move a file based on a provided new path and returns the new path.

Both absolute and relative paths are accepted. Relative paths will resolve from the class instantiated path root directory.

- Parameters:
  - **newPath** `string`: The new location of the file.
- Returns: `Promise<string>`: The new path of the renamed/moved file as string.
- Throws: `PathJSError` if the provided new path location resolves to an already existing file.

```ts
import Path from 'path-js'

const oldFile = 'path/to/file_to_be_renamed.txt'
const oldFilePath = new Path(file)

const newFilePath = 'path/to/renamed_file.txt'
await filePath.renameFile(newFilePath)

console.log(oldFilePath.exists()) // false, since it was renamed/moved.
```

## `Path.createFileWriteStream()`

Asynchronously creates a file write stream and returns a `FileWriteStreamReturnObject` object, that contains two values: `stream` (The actual file write stream), and `once` (A promise that will be resolved when you close the file write stream).

- Returns: `FileWriteStreamReturnObject`
- Throws: `PathJSError` if the class instance path doesn't resolve to a file.

```ts
import Path from 'path-js'

const file = 'path/to/file.txt'
const filePath = new Path(file)
const { stream, once } = await filePath.createFileWriteStream()

// Write some data
const fileNewContents = 'example text'
stream.write(fileNewContents)

// Close stream
stream.end()

// Add this line to make the whole process sequential
await once
```

## `Path.readFileOffset()`

Asynchronously opens the file resolved from the class instance path, reads only the bytes after the specified offset, closes it and returns the content as a `Buffer`.

- Parameters:

  - **byteOffset** `number`: The offset start where the file will be read.
  - **byteLength**_?_ `number`: `OPTIONAL` The length of the bytes to want to be read. If `undefined`, it will read the entire file, starting from the provided offset.

- Returns: `Buffer`
- Throws: `PathJSError` if the class instance path doesn't resolve to an existing file.

```ts
import Path from 'path-js'

const file = 'path/to/binary_file.bin'
const filePath = new Path(file)

// Assuming you want to manipulate the file header and
// it has a length of 64 bytes (0x40)...
const fileHeader = await filePath.readFileOffset(0x0, 0x40)
```

## `Path.readFileOffsetFromHandler()`

Works as `Path.readFileOffset()`, but uses an already instantiated `FileHandle` object rather than create a new instance to automatically close it, saving resources.

This method doesn't actually read the file resolved on the class instantiated path at all and it exists only to wrap this functional logic in a common place.

- Parameters:
  - **handler** `FileHandle`: An already instantiated `FileHandle` object from `fs.promises.open()` function.
  - **byteOffset** `number`: The offset start where the file will be read.
  - **byteLength**_?_ `number`: `OPTIONAL` The length of the bytes to want to be read. If `undefined`, it will read the entire file, starting from the provided offset.
- Returns: `Buffer`

```ts
import Path from 'path-js'
import { open } from 'node:fs/promises'

const file = 'path/to/binary_file.bin'
const filePath = new Path(file)

// Open the file to create a handler
const fileHandler = await open(filePath.path)

// Assuming you want to manipulate the file header and
// it has a length of 64 bytes (0x40)...
const fileHeader = await filePath.readFileOffsetFromHandler(
  fileHandler,
  0x0,
  0x40
)

// You can re-use the file handler on some other logic...
// But don't forget to close it!
...

fileHandler.close()
```

# Directory methods

These methods are meant to manipulate directories or contents inside of them.

## `Path.createFileOnDir()`

Asynchronously creates a file inside the class instance directory path and returns the created file path.

- Parameters:
  - **filename** `string`: The name of the new file to be created.
  - **data**_?_ `FileWriteDataTypes | null`: `OPTIONAL` The content of the new file to be created.
  - **encoding**_?_ `BufferEncodingOrNull`: `OPTIONAL` The encoding of the content.
- Returns: `string`
- Throws: `PathJSError`: if the provided file already exists.

```ts
import Path from 'path-js'

const dir = 'path/to/a/directory'
const dirPath = new Path(dir)

const newFilePath = await dir.touch('newfile.txt', 'Hello, World')
console.log(newFilePath) // 'path/to/a/directory/newfile.txt'
```

## `Path.readDir()`

Asynchronously reads all directory files and returns their paths on an `Array`.

- Parameters:
  - **asAbsolutePaths**_?_ `boolean`: `OPTIONAL` If `true`, the path of all files from the folder will be absolute paths rather than just the file/directory names. Default is `false`.
- Returns: `string[]`
- Throws: `PathJSError` if the class instance path doesn't resolve to an existing directory.

```ts
import Path from 'path-js'

const dir = 'path/to/a/directory'
const dirPath = new Path(dir)

// Assuming you have two files called "test.txt" and "other.txt"
// inside the "path/to/a/directory"...
const dirContents = await dirPath.readDir()

console.log(dirContents) // ['test.txt', 'other.txt']
```

## `Path.mkDir()`

Asynchronously creates a directory and returns the created directory path.

- Parameters:
  - **recursive**_?_ `boolean`: `OPTIONAL` Indicates whether parent folders should be created. If a folder was created, the path to the first created folder will be returned. Default is `false`.
- Returns: `string`
- Throws: `PathJSError` if the class instance path resolves to an existing directory.

```ts
import Path from 'path-js'

const dir = 'path/to/a/directory'
const dirPath = new Path(dir)
console.log(dir.exists()) // false

const dirPathAgain = await dirPath.mkDir()
console.log(dir.exists()) // true
console.log(dirPathAgain) // 'path/to/a/directory'
console.log(dirPath.path === dirPathAgain) // true
```

## `Path.deleteDir()`

Asynchronously deletes a directory and all its contents.

- Parameters:
  - **recursive**_?_ `boolean`: `OPTIONAL` If `true`, perform a recursive directory removal. In recursive mode, operations are retried on failure. Default is `true`.
- Throws: `PathJSError` if the class instance path doesn't resolve to an existing directory.

```ts
import Path from 'path-js'

const dir = 'path/to/a/directory/to/be/deleted'
const dirPath = new Path(dir)

const dirContents = await dirPath.rmDir()
```
