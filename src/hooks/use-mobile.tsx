
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false); // Default to false for server and initial client render

  React.useEffect(() => {
    // This function will only run on the client
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkDevice(); // Check on mount
    
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []); // Empty dependency array ensures it runs once on mount on the client

  return isMobile;
}
