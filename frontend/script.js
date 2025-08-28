// HTML 요소 가져오기
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// 캔버스 설정: 화질 개선을 위해 렌더링 설정
ctx.imageSmoothingEnabled = false; // 이미지 보간을 비활성화하여 픽셀을 선명하게 유지합니다.

// 게임 변수
let score = 0;
let isGameOver = false;
let logos = [];
let gameSpeed = 1.5;

// 플레이어 설정
const player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 50, // 플레이어의 크기 (원본 사이즈)
  height: 50, // 플레이어의 크기 (원본 사이즈)
  radius: 25, // 플레이어의 원형 히트박스 반지름
  image: new Image()
};
player.image.src = 'chacha.png'; // chacha.png로 이미지 변경

// 로고 설정
const logoImages = [
  new Image(),
  new Image(),
  new Image(),
  new Image()
];
logoImages[0].src = 'left_A.png';
logoImages[1].src = 'right_A.png';
logoImages[2].src = 'N.png';
logoImages[3].src = 'ANA.png';

const ANA_INDEX = 3; // ANA.png의 인덱스

// 마우스 입력 핸들러
canvas.addEventListener('mousemove', (e) => {
  if (isGameOver) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;

  // 플레이어의 중앙 x 좌표를 마우스 위치에 맞춥니다.
  player.x = mouseX;

  // 화면 밖으로 나가지 않도록
  if (player.x - player.radius < 0) {
    player.x = player.radius;
  }
  if (player.x + player.radius > canvas.width) {
    player.x = canvas.width - player.radius;
  }
});

// 게임 다시 시작 버튼 클릭 핸들러
restartButton.addEventListener('click', () => {
  resetGame();
});

// 게임 초기화
function resetGame() {
  score = 0;
  isGameOver = false;
  logos = [];
  gameSpeed = 1.5;
  player.x = canvas.width / 2;
  scoreDisplay.textContent = score;
  gameOverScreen.classList.add('hidden');
  gameLoop();
}

// 충돌 감지 함수 (원형 히트박스)
function checkCircleCollision(x1, y1, r1, x2, y2, r2) {
  const distanceX = x1 - x2;
  const distanceY = y1 - y2;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  return distance < r1 + r2;
}

// 게임 업데이트
function update() {
  if (isGameOver) return;

  // 로고 생성 (생성 확률을 고정)
  // gameSpeed와 상관없이 일정한 확률로 로고를 생성합니다.
  const spawnRate = 0.03; // 이 값을 조절하여 로고 생성 빈도를 바꿀 수 있습니다.
  if (Math.random() < spawnRate) {
    const randomIndex = Math.floor(Math.random() * logoImages.length);
    const randomImage = logoImages[randomIndex];
    let randomSize;

    if (randomIndex === ANA_INDEX) {
      randomSize = 40 + Math.random() * 40;
    } else {
      randomSize = 25 + Math.random() * 25;
    }

    const logoRadius = randomSize / 2;
    logos.push({
      x: Math.random() * (canvas.width - randomSize) + logoRadius,
      y: -randomSize + logoRadius,
      width: randomSize,
      height: randomSize,
      radius: logoRadius,
      speed: 2 * gameSpeed,
      image: randomImage
    });
  }

  // 로고 이동 및 충돌 감지
  logos.forEach(logo => {
    logo.y += logo.speed;

    // 원형 충돌 감지
    if (checkCircleCollision(player.x, player.y, player.radius, logo.x, logo.y, logo.radius)) {
      isGameOver = true;
      finalScoreDisplay.textContent = Math.floor(score / 10); // 최종 점수도 10으로 나눈 값으로 변경
      gameOverScreen.classList.remove('hidden');
    }
  });

  // 화면 밖으로 나간 로고 제거
  logos = logos.filter(logo => logo.y < canvas.height);

  // 점수 증가 및 게임 속도 조절
  score += 1;
  gameSpeed += 0.001;
  scoreDisplay.textContent = Math.floor(score / 10);
}

// 게임 그리기
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 플레이어 그리기 (중심 좌표 기준)
  ctx.drawImage(player.image, player.x - player.radius, player.y - player.radius, player.width, player.height);

  // 로고 그리기 (중심 좌표 기준)
  logos.forEach(logo => {
    ctx.drawImage(logo.image, logo.x - logo.radius, logo.y - logo.radius, logo.width, logo.height);
  });
}

// 게임 루프
function gameLoop() {
  if (!isGameOver) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

// 게임 시작
gameLoop();
