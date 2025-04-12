import * as L from "leaflet";

declare module "leaflet" {
  namespace Routing {
    interface RoutingControlOptions {
      waypoints: L.LatLng[];
      router?: any;
      plan?: any;
      show?: boolean;
      addWaypoints?: boolean;
      routeWhileDragging?: boolean;
      routeDragInterval?: number;
      showAlternatives?: boolean;
      altLineOptions?: object;
      fitSelectedRoutes?: boolean | "smart";
      lineOptions?: object;
      createMarker?: Function;
    }

    class Control extends L.Control {
      constructor(options: RoutingControlOptions);
      getPlan(): any;
      getRouter(): any;
      route(): void;
    }

    class Itinerary extends L.Control {
      constructor(options?: any);
    }

    class Line extends L.LayerGroup {
      constructor(route: any, options?: any);
    }

    class Plan extends L.Layer {
      constructor(waypoints: any[], options?: any);
      addWaypoint(waypoint: any, latLng: L.LatLng, index?: number): any;
      setWaypoints(waypoints: any[]): any;
      spliceWaypoints(
        index: number,
        waypointsToRemove: number,
        ...waypoints: any[]
      ): any[];
      getWaypoints(): any[];
    }

    function control(options: RoutingControlOptions): Control;
    function itinerary(options?: any): Itinerary;
    function line(route: any, options?: any): Line;
    function plan(waypoints: any[], options?: any): Plan;
  }
}
