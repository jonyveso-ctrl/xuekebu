document.addEventListener('DOMContentLoaded', function () {
    // Video background logic
    const videoA = document.getElementById('bg-video-A');
    const videoB = document.getElementById('bg-video-B');

    if (videoA && videoB) {
        let activeVideo = videoA;
        let inactiveVideo = videoB;
        const crossfadeTime = 1.5; // 交叉淡出时间（秒）

        function monitorVideo() {
            if (activeVideo.duration - activeVideo.currentTime < crossfadeTime) {
                inactiveVideo.currentTime = 0;
                inactiveVideo.play();
                
                activeVideo.style.opacity = 0;
                inactiveVideo.style.opacity = 1;

                // 交换角色
                let temp = activeVideo;
                activeVideo = inactiveVideo;
                inactiveVideo = temp;
            }
        }

        videoA.addEventListener('timeupdate', monitorVideo);
        videoB.addEventListener('timeupdate', monitorVideo);
    }

    // Live clock logic
    const clockElement = document.getElementById('live-clock');

    function updateClock() {
        if (clockElement) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }

    if (clockElement) {
        setInterval(updateClock, 1000);
        updateClock(); // Initial call
    }
});
