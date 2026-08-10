// Type imports removed - these are JSDoc type definitions only, not actual exports
import { riderMapHtml, RIDER_MARKER_STYLES } from '@/lib/mapIcons';

let ActualRiderMapOverlay = null;
let ActualAreaLabelOverlay = null;

function getRiderClass() {
  if (!ActualRiderMapOverlay) {
    ActualRiderMapOverlay = class extends google.maps.OverlayView {
      constructor(position, rider, isLive) {
        super();
        this.position = position;
        this.rider = rider;
        this.isLive = isLive;
        this.div = null;
      }

      onAdd() {
        if (!document.getElementById('jhyaap-rider-marker-styles')) {
          const style = document.createElement('style');
          style.id = 'jhyaap-rider-marker-styles';
          style.textContent = RIDER_MARKER_STYLES;
          document.head.appendChild(style);
        }

        this.div = document.createElement('div');
        this.div.innerHTML = riderMapHtml(this.rider, this.isLive);
        const panes = this.getPanes();
        panes?.overlayMouseTarget.appendChild(this.div);
      }

      draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        if (!projection) return;

        const point = projection.fromLatLngToDivPixel(
          new google.maps.LatLng(this.position.lat, this.position.lng)
        );
        if (!point) return;

        const marker = this.div.querySelector('.jhyaap-rider-marker');
        if (marker) {
          marker.style.left = `${point.x}px`;
          marker.style.top = `${point.y}px`;
        }
      }

      update(position, rider, isLive) {
        this.position = position;
        this.rider = rider;
        this.isLive = isLive;
        if (this.div) {
          this.div.innerHTML = riderMapHtml(rider, isLive);
        }
        this.draw();
      }

      onRemove() {
        this.div?.remove();
        this.div = null;
      }
    };
  }
  return ActualRiderMapOverlay;
}

function getAreaClass() {
  if (!ActualAreaLabelOverlay) {
    ActualAreaLabelOverlay = class extends google.maps.OverlayView {
      constructor(position, label, highlighted = false) {
        super();
        this.position = position;
        this.label = label;
        this.highlighted = highlighted;
        this.div = null;
      }

      onAdd() {
        this.div = document.createElement('div');
        this.div.style.cssText = `
          position:absolute; transform:translate(-50%,-50%);
          pointer-events:none; white-space:nowrap;
          font-size:${this.highlighted ? '11px' : '9px'};
          font-weight:${this.highlighted ? '700' : '600'};
          color:${this.highlighted ? '#fbbf24' : '#94a3b8'};
          text-shadow:0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8);
          padding:1px 4px;
          background:${this.highlighted ? 'rgba(245,158,11,0.15)' : 'transparent'};
          border-radius:4px;
        `;
        this.div.textContent = this.label;
        this.getPanes()?.overlayLayer.appendChild(this.div);
      }

      draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        if (!projection) return;
        const point = projection.fromLatLngToDivPixel(
          new google.maps.LatLng(this.position.lat, this.position.lng)
        );
        if (point) {
          this.div.style.left = `${point.x}px`;
          this.div.style.top = `${point.y + 8}px`;
        }
      }

      onRemove() {
        this.div?.remove();
        this.div = null;
      }
    };
  }
  return ActualAreaLabelOverlay;
}

export class RiderMapOverlay {
  constructor(position, rider, isLive) {
    const Cls = getRiderClass();
    this.instance = new Cls(position, rider, isLive);
  }
  setMap(map) {
    this.instance?.setMap(map);
  }
  update(position, rider, isLive) {
    this.instance?.update(position, rider, isLive);
  }
}

export class AreaLabelOverlay {
  constructor(position, label, highlighted = false) {
    const Cls = getAreaClass();
    this.instance = new Cls(position, label, highlighted);
  }
  setMap(map) {
    this.instance?.setMap(map);
  }
}

