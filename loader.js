document.addEventListener('DOMContentLoaded', () => {
    const percentageElement = document.getElementById('percentage');
    const loaderContainer = document.querySelector('.loader-container');
    const poetryQuote = document.getElementById('poetry-quote');
    const poetryAuthor = document.getElementById('poetry-author');
    const poetryTitle = document.getElementById('poetry-title');

    const poetryData = [
        { quote: "醉后不知天在水，满船清梦压星河", author: "唐珙", title: "《题龙阳县青草湖》" },
        { quote: "且就洞庭赊月色，将船买酒白云边", author: "李白", title: "《游洞庭湖五首·其二》" },
        { quote: "蝉蜕尘埃外，蝶梦水云乡", author: "张孝祥", title: "《水调歌头·泛湘江》" },
        { quote: "春风如醇酒，着物物不知", author: "程俱", title: "《过红梅阁一首》" },
        { quote: "休对故人思故国，且将新火试新茶，诗酒趁年华", author: "苏轼", title: "《望江南·超然台作》" },
        { quote: "落絮无声春堕泪，行云有影月含羞", author: "吴文英", title: "《浣溪沙·门隔花深梦旧游》" }
    ];

    const randomPoetry = poetryData[Math.floor(Math.random() * poetryData.length)];

    if (poetryQuote) poetryQuote.textContent = randomPoetry.quote;
    if (poetryAuthor) poetryAuthor.textContent = `——${randomPoetry.author}`;
    if (poetryTitle) poetryTitle.textContent = randomPoetry.title;

    const duration = 3000; // 3 seconds
    const intervalTime = 30; // update every 30ms

    let currentPercentage = 0;
    const increment = 1;

    const interval = setInterval(() => {
        currentPercentage += increment;
        if (currentPercentage >= 100) {
            currentPercentage = 100;
            clearInterval(interval);
            
            if(loaderContainer) {
                loaderContainer.classList.add('fade-out');
            }

            setTimeout(() => {
                window.location.href = 'tree_animation.html';
            }, 1000);
        }
        if (percentageElement) {
            percentageElement.textContent = `${currentPercentage}%`;
        }
    }, intervalTime);
});
