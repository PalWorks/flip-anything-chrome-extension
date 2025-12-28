import React, { useEffect } from 'react';

export const UninstallFeedback: React.FC = () => {
    useEffect(() => {
        // Load Tally widget script
        const script = document.createElement('script');
        script.src = "https://tally.so/widgets/embed.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full bg-white z-50">
            <iframe
                data-tally-src="https://tally.so/r/A7KEAo?transparentBackground=1&formEventsForwarding=1"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Flip & Rotate Ultimate - Uninstallation Feedback Form"
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, border: 0 }}
            />
        </div>
    );
};
