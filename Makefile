build-release:
	VERSION=`node -pe "require('./package.json').version"` && \
	browserify src/media-player.js | \
	babel --presets es2015 | \
	uglifyjs - -o build/flare-audio-player-"$$VERSION".min.js