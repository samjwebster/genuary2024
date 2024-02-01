let p;
let bgc;
let bgt;
let cols;

let myFont;
function preload() {
    myFont = loadFont("../assets/font/Spectral-Regular.otf");
}

function setup() {
    let scale = 1;
    let res = [1000*scale, 1000*scale]
    cnv = createCanvas(...res);

    for(let i = sentences.length-1; i >= 0; i--) {
        if(sentences[i].length > 64) sentences.splice(i, 1);
    }

    p = getPalette();

    cols = p.colors.slice();

    let sortByValue = (a, b) => {
        let ba = (a.levels[0] + a.levels[1] + a.levels[2])/3;
        let bb = (b.levels[0] + b.levels[1] + b.levels[2])/3;
        return bb - ba;
    }
    cols.sort(sortByValue);

    if(random()>0.5) cols = cols.reverse();

    bgc = cols[0];
    bgt = color(bgc.levels[0], bgc.levels[1], bgc.levels[2], 0);

    background(bgc);

    cols.splice(0, 1);

    createBlackoutPoem();

    granulate(6);


    noLoop();
}

function createBlackoutPoem() {
    let poem = new Poem();
    poem.render();
}


class Poem {
    constructor() {
        let sentenceCount = floor(random(2, 20));
        sentences = shuffleArray(sentences);
        let selection = [];
        let maxLength = -Infinity;
        for(let i = 0; i < sentenceCount; i++) {
            selection.push(sentences[i]);
            if(sentences[i].length > maxLength) maxLength = sentences[i].length;
            if(random()>0.8) {
                selection.push("SPACER");
            }
        }

        let size = min((width*0.8)/(maxLength/2), (height*0.8)/selection.length);

        this.lines = [];
        for(let i = 0; i < selection.length; i++) {
            if(selection[i] == "SPACER") continue;
            let t = i/(selection.length-1);
            let y = lerp(height*0.1, height*0.9, t);
            let x = width/2;
            this.lines.push(new Line(x, y, selection[i], size));
        }

    }

    render() {
        this.lines.forEach(l => l.render());
    }
}

class Line {
    constructor(x, y, text, size) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.size = size;

        let wordSpans = [];
        let on = true;
        let spanStart = 0
        for(let i = 0; i < text.length; i++) {
            let c = text[i];
            if(c == " ") {
                wordSpans.push([spanStart, i]);
                spanStart = i+1;
            }
        }
        if(spanStart < text.length) wordSpans.push([spanStart, text.length]);

        this.wordSpans = wordSpans;
    }

    render() {
        textFont(myFont);
        textSize(this.size);
        noStroke();
        fill(cols[cols.length-1]);

        textAlign(CENTER);
        text(this.text, this.x, this.y);

        fill(cols[floor(cols.length/2)])
        let w = textWidth(this.text);
        let xStart = this.x - (w/2);
        let xEnd = this.x + (w/2);
        let rectH = textSize(); 
        let wBump = 0.002*width;

        for(let i = 0; i < this.wordSpans.length; i++) {
            if(random()>0.75) {
                let curr = this.wordSpans[i];

                
                let start = curr[0];
                let end = curr[1];

                let wPrev = textWidth(this.text.substring(0, start));
                let wCurr = textWidth(this.text.substring(start, end));
                

                rect(xStart + wPrev - wBump, this.y-rectH, wCurr + (2*wBump), rectH*1.25);
            }
        }
    }
}





function rc() {
    return p.getRandomCol();
}

sentences = [
    "The bullet pierced the window shattering it before missing Danny's head by mere millimeters.",
    "Love is not like pizza.",
    "Despite multiple complications and her near-death experience",
    "Cats are good pets, for they are clean and are not noisy.",
    "The teenage boy was accused of breaking his arm simply to get out of the test.",
    "Nothing is as cautiously cuddly as a pet porcupine.",
    "Shakespeare was a famous 17th-century diesel mechanic.",
    "He went on a whiskey diet and immediately lost three days.",
    "Blue sounded too cold at the time and yet it seemed to work for gin.",
    "They were excited to see their first sloth.",
    "The fish listened intently to what the frogs had to say.",
    "A good example of a useful vegetable is medicinal rhubarb.",
    "You can't compare apples and oranges, but what about bananas and plantains?",
    "Karen realized the only way she was getting into heaven was to cheat.",
    "He ran out of money, so he had to stop playing poker.",
    "Your girlfriend bought your favorite cookie crisp cereal but forgot to get milk.",
    "It's difficult to understand the lengths he'd go to remain short.",
    "To the surprise of everyone, the Rapture happened yesterday but it didn't quite go as expected.",
    "The spa attendant applied the deep cleaning mask to the gentleman’s back.",
    "She wanted to be rescued, but only if it was Tuesday and raining.",
    "The moon is made of green cheese, according to intergalactic mice.",
    "In an alternate universe, pineapples are the currency of choice for penguins.",
    "Bananas have been declared the official communication device of the jungle.",
    "Cats are secretly plotting to take over the world and replace all humans with cardboard boxes.",
    "Scientists have discovered a parallel dimension where socks disappear to start their own sock civilization.",
    "Aliens communicate with Earth through interpretive dance competitions.",
    "The Loch Ness Monster and Bigfoot are hosting a joint reality show on underwater hide-and-seek.",
    "Giraffes are actually aliens in disguise, conducting intergalactic research on Earth's plant life.",
    "Time travel is possible, but only for squirrels who want to relive their favorite acorn moments.",
    "In an enchanted forest, trees have regular tea parties and gossip about the weather.",
    "The sun takes vacations and is currently backpacking through the Milky Way.",
    "Chocolate has been proven to be a superfood for unicorns, enhancing their magical abilities.",
    "All clouds are sentient beings with a passion for poetry, constantly writing love letters to the rain.",
    "Dinosaurs still exist, but they're skilled in camouflage and work as fashion consultants for chameleons.",
    "Mermaids have an advanced underwater civilization with a booming real estate market in coral castles.",
    "Wormholes are actually secret portals to a cosmic karaoke bar where black holes sing duets.",
    "Robots have a secret society dedicated to perfecting the art of interpretive jazz dance.",
    "Pizza slices are interdimensional portals that transport you to different toppings realms.",
    "Tea cups are ancient artifacts used by time-traveling archaeologists to explore historical brews.",
    "Vampires attend therapy sessions to cope with their garlic aversion issues.",
    "Your smile, my favorite sunrise.",
    "In your eyes, I find my home.",
    "Love's whispers linger in our shared silences.",
    "Your touch, a gentle symphony on my skin.",
    "Together, our hearts waltz in harmony.",
    "Your laughter, a melody in my soul.",
    "Every heartbeat, a love letter to you.",
    "In your gaze, I discover endless galaxies.",
    "Our love, a timeless dance of two souls.",
    "With you, every moment is a cherished memory.",
    "Your love, the canvas of my dreams.",
    "In your arms, I find my sanctuary.",
    "Your kiss, the sweetest poetry ever tasted.",
    "Love's magic resides in the simplicity of 'us.'",
    "With you, every day is Valentine's Day.",
    "Your presence, the essence of my joy.",
    "In the quiet, our love speaks volumes.",
    "Your love, the compass guiding my heart.",
    "Together, we create an eternal love story.",
    "In your embrace, I find my peace.",
    "Improve your goldfish's physical fitness by getting him a bicycle.",
    "Car safety systems have come a long way, but he was out to prove they could be outsmarted.",
    "As he entered the church he could hear the soft voice of someone whispering into a cell phone.",
    "I like to leave work after my eight-hour tea-break.",
    "Writing a list of random sentences is harder than I initially thought it would be.",
    "Joyce enjoyed eating pancakes with ketchup.",
    "I never knew what hardship looked like until it started raining bowling balls.",
    "Someone I know recently combined Maple Syrup & buttered Popcorn thinking it would taste like caramel popcorn. It didn’t and they don’t recommend anyone else do it either.",
    "I want a giraffe, but I'm a turtle eating waffles.",
    "It took him a month to finish the meal.",
    "Tuesdays are free if you bring a gnome costume.",
    "Two seats were vacant.",
    "Three years later, the coffin was still full of Jello.",
    "As the rental car rolled to a stop on the dark road, her fear increased by the moment.",
    "His ultimate dream fantasy consisted of being content and sleeping eight hours in a row.",
    "The thick foliage and intertwined vines made the hike nearly impossible.",
    "He had accidentally hacked into his company's server.",
    "He went back to the video to see what had been recorded and was shocked at what he saw.",
    "Behind the window was a reflection that only instilled fear.",
    "He played the game as if his life depended on it and the truth was that it did.",
    "Why?",
    "Stop!",
    "How?",
    "Now?",
    "Again?",
    "Why not?",
    "No!",
    "Yes!",
    "What?",
    "Huh?",
    "Next?",
    "Who?",
    "Sixty-Four comes asking for bread.",
    "When money was tight, he'd get his lunch money from the local wishing well.",
    "If any cop asks you where you were, just say you were visiting Kansas.",
    "The golden retriever loved the fireworks each Fourth of July.",
    "Mothers spend months of their lives waiting on their children.",
    "There were a lot of paintings of monkeys waving bamboo sticks in the gallery.",
    "It's never been my responsibility to glaze the donuts.",
    "Too many prisons have become early coffins.",
    "Pink horses galloped across the sea.",
    "Pantyhose and heels are an interesting choice of attire for the beach.",
    "The clock within this blog and the clock on my laptop are 1 hour different from each other.",
    "Peter found road kill an excellent way to save money on dinner.",
    "The tour bus was packed with teenage girls heading toward their next adventure.",
    "It was the first time he had ever seen someone cook dinner on an elephant.",
    "Improve your goldfish's physical fitness by getting him a bicycle.",
    "Thirty years later, she still thought it was okay to put the toilet paper roll under rather than over.",
    "The random sentence generator generated a random sentence about a random sentence.",
    "The bees decided to have a mutiny against their queen.",
    "Purple is the best city in the forest.",
    "He had a wall full of masks so she could wear a different face every day.",
    "The small white buoys marked the location of hundreds of crab pots.",
    "She was sad to hear that fireflies are facing extinction due to artificial light, habitat loss, and pesticides.",
    "It was obvious she was hot, sweaty, and tired.",
    "There are few things better in life than a slice of pie.",
    "In the end, he realized he could see sound and hear words.",
    "Thirty years later, she still thought it was okay to put the toilet paper roll under rather than over.",
    "It was a really good Monday for being a Saturday.",
    "She is never happy until she finds something to be unhappy about; then, she is overjoyed.",
    "It must be five o'clock somewhere.",
    "I just wanted to tell you I could see the love you have for your child by the way you look at her.",
    "Three years later, the coffin was still full of Jello.",
    "Traveling became almost extinct during the pandemic.",
    "Tuesdays are free if you bring a gnome costume.",
    "Never underestimate the willingness of the greedy to throw you under the bus.",
    "She had that tint of craziness in her soul that made her believe she could actually make a difference.",
    "She looked into the mirror and saw another person.",
    "The virus had powers none of us knew existed.",
    "The bread dough reminded her of Santa Claus’s belly.",
    "The wake behind the boat told of the past while the open sea foretold life in the unknown future.",
    "Truth in advertising and dinosaurs with skateboards have much in common."
];

