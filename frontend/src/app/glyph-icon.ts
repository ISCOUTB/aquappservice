// CREDITS TO ITS AUTHOR, IvanSancez (ivan@sanchezortega.es)
// I just modified it so it works with Angular
// For more information, visit the repo: https://github.com/Leaflet/Leaflet.Icon.Glyph
import { Icon, DomUtil, point } from 'leaflet';

let GlyphIcon = Icon.extend({
	options: {
		iconSize: [28, 41],
		iconAnchor:  [12, 41],
		popupAnchor: [1, -34],
        shadowSize:  [41, 41],
// 		iconUrl: 'glyph-marker-icon.png',
// 		iconSize: [35, 45],
// 		iconAnchor:   [17, 42],
// 		popupAnchor: [1, -32],
// 		shadowAnchor: [10, 12],
// 		shadowSize: [36, 16],
// 		bgPos: (Point)
		className: '',
		prefix: '',
		glyph: 'home',
		glyphColor: 'white',
		glyphSize: '10px',	// in CSS units
		glyphAnchor: [0, -7]	// In pixels, counting from the center of the image.
	},

	createIcon: function () {
		var div = document.createElement('div'),
			options = this.options;

		if (options.glyph) {
			div.appendChild(this._createGlyph());
		}

		this._setIconStyles(div, options.className);
		return div;
	},

	_createGlyph: function() {
		var glyphClass,
		    textContent,
		    options = this.options;

		if (!options.prefix) {
			glyphClass = '';
			textContent = options.glyph;
		} else if(options.glyph.slice(0, options.prefix.length+1) === options.prefix + "-") {
			glyphClass = options.glyph;
		} else {
			glyphClass = options.prefix + "-" + options.glyph;
		}

		var span = DomUtil.create('span', options.prefix + ' ' + glyphClass);
		span.style.fontSize = options.glyphSize;
		span.style.color = options.glyphColor;
		span.style.width = options.iconSize[0] + 'px';
		span.style.lineHeight = options.iconSize[1] + 'px';
		span.style.textAlign = 'center';
		span.style.marginLeft = options.glyphAnchor[0] + 'px';
		span.style.marginTop = options.glyphAnchor[1] + 'px';
		span.style.pointerEvents = 'none';

		if (textContent) {
			span.innerHTML = textContent;
			span.style.display = 'inline-block';
		}

		return span;
    },
    _setIconStyles: function (div, name) {
		var options = this.options,
		    size = point(options['iconSize']),
		    anchor = point(options.iconAnchor);

		if (!anchor && size) {
			anchor = size.divideBy(2);
		}

		div.className = 'leaflet-marker-icon leaflet-glyph-icon ' + name;
		var src = this._getIconUrl('icon');
		if (src) {
			div.style.backgroundImage = "url('" + src + "')";
		}

		if (options.bgPos) {
			div.style.backgroundPosition = (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
		}
		if (options.bgSize) {
			div.style.backgroundSize = (options.bgSize.x) + 'px ' + (options.bgSize.y) + 'px';
		}

		if (anchor) {
			div.style.marginLeft = (-anchor.x) + 'px';
			div.style.marginTop  = (-anchor.y) + 'px';
		}

		if (size) {
			div.style.width  = size.x + 'px';
			div.style.height = size.y + 'px';
		}
	}
});

// Base64-encoded version of glyph-marker-icon.png

export function glyphIcon (options: any) {
	return new GlyphIcon(options);
};
