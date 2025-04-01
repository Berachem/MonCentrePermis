// Fichier regroupent des fonctions 

// Fonction permettant de récupérer les données sur l'appareil de l'utilisateur 
export function getDeviceType() { // à utiliser plus tard...
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile/i.test(userAgent)) {
      return 'Phone';
    } else if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'Tablet';
    } else {
      return 'Device';
    }
  }