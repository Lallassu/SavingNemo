rm super.js
cat utils.js net.js env.js loader.js player.js main.js > super.js
java -jar yuicompressor-2.4.8.jar super.js -o super-min.js --charset utf-8

