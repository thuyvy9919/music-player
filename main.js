// 1. Render songs
// 2. Scroll Top
// 3. Play / Pause / Seek
// 4. CD rotate
// 5. Next / Prev
// 6. Ramdom
// 7. Next / Repeat when ended
// 8. Active song
// 9. Scroll active song into view
// 10.Play song when click

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "PLAYER";

const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");

const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Chỉ Còn Lại Tình Yêu",
            singer: "Bùi Anh Tuấn",
            path: "./music/ChiConLaiTinhYeu.mp3",
            image: "./img/ChiConLaiTinhYeu.jpg",
        },
        {
            name: "Khi Ta Già",
            singer: "Vũ Thịnh",
            path: "./music/KhiTaGia.mp3",
            image: "./img/KhiTaGia.jpg",
        },
        {
            name: "Xuân Thì",
            singer: "Hà Anh Tuấn",
            path: "./music/XuanThi.mp3",
            image: "./img/XuanThi.jpg",
        },
        {
            name: "Mascara",
            singer: "Chillies x BLAZE",
            path: "./music/Mascara.mp3",
            image: "./img/Mascara.jpg",
        },
        {
            name: "Bước qua nhau",
            singer: "Vũ",
            path: "./music/BuocQuaNhau.mp3",
            image: "./img/BuocQuaNhau.jpg",
        },
        // {
        //     name: "Mascara",
        //     singer: "Chillies x BLAZE",
        //     path: "./music/Mascara.mp3",
        //     image: "./img/Mascara.jpg"
        // },
        // {
        //     name: "Xuân Thì",
        //     singer: "Hà Anh Tuấn",
        //     path: "./music/XuanThi.mp3",
        //     image: "./img/XuanThi.jpg"
        // },
        // {
        //     name: "Mascara",
        //     singer: "Chillies x BLAZE",
        //     path: "./music/Mascara.mp3",
        //     image: "./img/Mascara.jpg"
        // }
    ],
    setConfig: function (key, value) {
        app.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(app.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${
                    index === this.currentIndex ? "active" : ""
                }" data-index = ${index}>
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        });
        playlist.innerHTML = htmls.join("");
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },
    handleEvents: function () {
        // const _this = this
        const cdWidth = cd.offsetWidth;

        //xử lý CD quay dừng
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 15000, //10s
                iterations: Infinity, //quay vô hạn
            }
        );
        cdThumbAnimate.pause();

        //xử lý phóng to thu nhỏ cd
        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        //xử lý khi click play
        playBtn.onclick = function () {
            //Khi nhấn nút play => check trạng thái của app.isPlaying
            if (app.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        //khi bài hát play
        audio.onplay = function () {
            app.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };

        //khi bài hát pause
        audio.onpause = function () {
            app.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        //khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };

        //xử lý khi tua bài hát
        progress.onchange = function (e) {
            // lấy ra % bài hát => console.log(e.target.value)
            // console.log(e.target.value/100 * audio.duration)
            const seekTime = (e.target.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        };

        //next song
        nextBtn.onclick = function () {
            if (app.isRandom) {
                app.playRandomSong();
            } else {
                app.nextSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        };

        //prev song
        prevBtn.onclick = function () {
            if (app.isRandom) {
                app.playRandomSong();
            } else {
                app.prevSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        };

        //xử lý random bật tắt
        randomBtn.onclick = function (e) {
            app.isRandom = !app.isRandom;
            app.setConfig("isRandom", app.isRandom);
            randomBtn.classList.toggle("active", app.isRandom);
        };

        //xử lý lặp lại 1 song
        repeatBtn.onclick = function (e) {
            app.isRepeat = !app.isRepeat;
            app.setConfig("isRepeat", app.isRepeat);
            repeatBtn.classList.toggle("active", app.isRepeat);
        };

        //xử lý nextsong khi audio kết thúc
        audio.onended = function () {
            if (app.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        //click playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");
            if (songNode || e.target.closest(".option")) {
                //xử lí khi click vào song
                if (songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    app.render();
                    audio.play();
                }
                //xử lí khi click vào song option
                if (e.target.closest(".option")) {
                }
            }
        };
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 200);
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        //gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        //định nghĩa các thuộc tính cho obj
        this.defineProperties();

        //lắng nghe/ xử lý các sự kiện (DOM events)
        this.handleEvents();

        //tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //render playlist
        this.render();

        //hiển thị trạng thái ban đầu của btn repeat và random
        randomBtn.classList.toggle("active", app.isRandom);
        repeatBtn.classList.toggle("active", app.isRepeat);
    },
};
app.start();
