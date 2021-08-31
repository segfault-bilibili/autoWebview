module.exports = {
  //use relative path
  publicPath: './',
  devServer: {
    //Hot reloading may not work on other device,
    //because it may send requests to LAN IP address,
    //which is not accessible (either simply unreachable or blocked by firewall)
    host: '127.0.0.1',
  }
}