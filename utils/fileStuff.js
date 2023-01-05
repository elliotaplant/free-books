module.exports = {
  getFilename: (url) => decodeURIComponent(url.split('/').slice(-1)[0]),
  getExtension: (url) => url.split('.').slice(-1)[0],
  changeExtension: (filename, newExtension) =>
    [...filename.split('.').slice(0, -1), newExtension].join('.'),
};
