"use client";

import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import geojson from "../../data/provinces.json";
import { NAMES, COLORS, NEIGHBORS } from "../../data/provinceNames";

const WIDTH = 580;
const HEIGHT = 380;

const TINY_PROVINCES = new Set(["SFO"]);

export default function BulgariaMap({
  ownership,
  hearts,
  currentPlayer,
  phase,
  onProvinceClick,
}) {
  const { paths, centroids } = useMemo(() => {
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], geojson);
    const pathGen = geoPath().projection(projection);
    const paths = [];
    const centroids = {};
    for (const feature of geojson.features) {
      const nuts3 = feature.properties.nuts3;
      paths.push({ nuts3, d: pathGen(feature) });
      centroids[nuts3] = pathGen.centroid(feature);
    }
    return { paths, centroids };
  }, []);

  const getProvinceStyle = (nuts3) => {
    const isHeart = nuts3 in hearts;
    const owner = ownership[nuts3];
    const hasOwner = owner !== undefined;

    let fill = "#e8ecf1";
    let stroke = "#64748b";
    let strokeWidth = 1;

    if (isHeart) {
      fill = COLORS[owner].primary;
      stroke = COLORS[owner].primary;
      strokeWidth = 2.5;
    } else if (hasOwner) {
      fill = COLORS[owner].light;
    }

    return { fill, stroke, strokeWidth };
  };

  const isClickable = (nuts3) => {
    if (phase === "hearts") {
      return !(nuts3 in hearts);
    }
    if (phase === "play") {
      if (nuts3 in hearts) return false;
      // Must be adjacent to a province the current player owns
      const neighbors = NEIGHBORS[nuts3] || [];
      return neighbors.some((n) => ownership[n] === currentPlayer);
    }
    return false;
  };

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ width: "65vw", backgroundColor: "#dbeafe", borderRadius: 8 }}
    >
      {paths.map(({ nuts3, d }) => {
        const { fill, stroke, strokeWidth } = getProvinceStyle(nuts3);
        const clickable = isClickable(nuts3);
        return (
          <g key={nuts3}>
            <path
              d={d}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              style={{
                transition: "fill 0.15s",
                cursor: clickable ? "pointer" : "default",
              }}
              onClick={() => clickable && onProvinceClick(nuts3)}
              onMouseEnter={(e) => {
                if (clickable && currentPlayer !== undefined) {
                  e.target.setAttribute("fill", COLORS[currentPlayer].light);
                }
              }}
              onMouseLeave={(e) => {
                e.target.setAttribute("fill", fill);
              }}
            />
          </g>
        );
      })}
      {paths.map(({ nuts3 }) => {
        const [cx, cy] = centroids[nuts3] || [0, 0];
        const isHeart = nuts3 in hearts;
        const label = TINY_PROVINCES.has(nuts3)
          ? nuts3
          : NAMES[nuts3] || nuts3;
        return (
          <g key={`label-${nuts3}`} pointerEvents="none">
            {isHeart && (
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                fontSize={10}
              >
                🏰
              </text>
            )}
            <text
              x={cx}
              y={isHeart ? cy + 7 : cy + 3}
              textAnchor="middle"
              fontSize={7}
              fill="#1e293b"
              fontFamily="system-ui, sans-serif"
              fontWeight={500}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
