<template>

</template>

<script>
//const notifier = require('node-notifier')
export default {
    name: 'notify',
    data() {
      return {
          publicPath: process.env.BASE_URL
      };
    },
    methods: {
        os () {
            return process.platform
        },
        send(obj) {
            var title = obj.title;
            var message = obj.message;
            var timeout = 5;
            if(obj.timeout != null) timeout = obj.timeout;
            if (process.env.VUE_APP_LINXF == 'capacitor') {
                cordova.plugins.notification.local.schedule({
                    title: title,
                    text: message,
                });
            } else if (process.env.VUE_APP_LINXF == 'electron') {
                var isWin = (navigator.platform == "Win32") || (navigator.platform == "Win64")|| (navigator.platform == "wow64");   
                if (!isWin) {
                    var notification = new Notification(title, {
                        body: message,
                        icon: require("@/assets/notifyicon.png"),
                    });
                } else {
                    const { remote } = window.electron
                    const { BrowserWindow } = remote
                    const path = require('path')
                    localStorage.setItem('nftitle', title);
                    localStorage.setItem('nfmessage', message);
                    let notifyWin = new BrowserWindow({
                        frame: false,
                        width: 400,
                        height: 300,
                        webPreferences: {
                            nodeIntegration: true,
                            webSecurity: false,
                            //preload: require("@/useelectron.js")
                        },
                    });
                    notifyWin.loadURL(window.location.href + 'notifypage');
                    notifyWin.on('closed', () => {
                        notifyWin = null
                    });
                    notifyWin.show();
                    notifyWin.focus();
                }
            } else {
                var notification = new Notification(title, {
                    body: message,
                    icon: require("@/assets/notifyicon.png"),
                });
            }
        }
    }
}
</script>
