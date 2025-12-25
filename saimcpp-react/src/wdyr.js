import React from 'react';

// Only load in development mode
if (import.meta.env.DEV) {
    const whyDidYouRender = await import('@welldone-software/why-did-you-render');
    whyDidYouRender.default(React, {
        trackAllPureComponents: false,  // Manual opt-in only (add .whyDidYouRender = true to components)
        trackHooks: true,               // Track hooks like useState, useEffect
        logOnDifferentValues: true,     // Log when props/state actually changed
        collapseGroups: true,           // Cleaner console output
    });
}
