// Rename this file into config.js.

module.exports = {
  // User token that owns the app (required).
  token: 'kKDdjXa1g9tKNs0-_yOwLyALC9gydEWP6gr9sHabuK1vuofjhQDDnlOclJeRIvYK-pj_',
  // Your Discord app's ID (required).
  appId: '157730590492196864',
  // Whether to enable some verbose output.
  debug: true,
  // Your player's MPRIS path.
  player: 'org.mpris.MediaPlayer2.NuvolaAppYoutubeMusic',
  // Asset names to not remove when purging old assets.
  whiteList: ['mySuperAsset1', 'mySuperAsset2'],
  // MPRIS interface (you shouldn't change this).
  mprisInterface: 'org.mpris.MediaPlayer2.Player',
  // MPRIS path (you shouldn't change this).
  mprisPath: '/org/mpris/MediaPlayer2',
  // Properties DBUS interface (you shouldn't change this).
  propertiesInterface: 'org.freedesktop.DBus.Properties',
  // Toggle whether the album should be shown in the details.
  showAlbumDetails: false,
  // Toggle whether the album cover functionality should be disabled entirely.
  disableCovers: false,
};
