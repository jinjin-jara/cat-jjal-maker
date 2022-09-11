import logo from './logo.svg';
import React from 'react';
import './App.css';
import Title from './components/Title';

//localStorage에 있는 값을 string이 아닌 본래 값으로 변경
const jsonLocalStorage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key) => {
    return JSON.parse(localStorage.getItem(key));
  },
};

// 생성 버튼 누를 때 패치 함수 호출
const fetchCat = async (text) => {
  const OPEN_API_DOMAIN = "https://cataas.com";
  const response = await fetch(`${OPEN_API_DOMAIN}/cat/says/${text}?json=true`);
  const responseJson = await response.json();
  return `${OPEN_API_DOMAIN}/${responseJson.url}`;
};

// 한글 검증 함수
const includesHangul = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text);

const Form = ({ updateMainCat, }) => {
  // 사용자 입력 text
  const [value, setValue] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  function handleInputChange(e) {
    const userValue = e.target.value;
    setErrorMessage('');
    if (includesHangul(userValue)) {
      setErrorMessage("한글은 입력할 수 없습니다.");
      return;
    }
    setValue(userValue.toUpperCase());
  }

  function handleFormSubmit(e) {
    e.preventDefault(); //refresh되는 것 방지
    setErrorMessage('');
    if (value === '') {
      setErrorMessage("공란은 입력할 수 없습니다.");
      return;
    }
    updateMainCat(value);  // 함수 실행
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="text" name="name" placeholder="영어 대사를 입력해주세요" onChange={handleInputChange} value={value} />
      <button type="submit">생성</button>
      <p style={{ color: "red" }}>{errorMessage}</p>
    </form>
  )
};

//컴포넌트는 대문자로 작성
//스타일 넘기기는 중괄호로 오브젝트 감싸기
//value는 String 타입으로 넘기기
function CatItem(props) {
  return (
    <li>
      {props.title}
      <img src={props.img} style={{ width: "150px" }} />
    </li>
  );
}

function Favorites({ favorites }) {
  if (favorites.length === 0) {
    return <div>사진 위 하트를 눌러 고양이 사진을 저장해봐요!</div>;
  }

  return (
    <ul className="favorites">
      {favorites.map(cat => (
        <CatItem img={cat} key={cat} />
      ))}
    </ul>
  );
};

// ES6 + 디스트럭처링 문법 적용
// 중괄호로 한번 더 묶어주면 props.img 한 효과를 볼 수 있다.
const MainCard = ({ img, onHeartClick, alreadyFavorite }) => {
  const heartIcon = alreadyFavorite ? "💖" : "🤍";
  return (
    <div className="main-card">
      <img src={img} alt="고양이" width="400" />
      <button onClick={onHeartClick}>{heartIcon}</button>
    </div>
  );
};

// 최상위 태그는 하나로만
// 꺽쇠 태그 안에 넣은 내용은 props.children
const App = () => {
  const CAT1 = "https://cataas.com/cat/60b73094e04e18001194a309/says/react";

  // 새로고침해도 상태는 끌고 갈 수 있게
  // const [counter, setCounter] = React.useState(jsonLocalStorage.getItem("counter") || 1);

  // 접속한 처음에만 로컬스토리지에 저장할 수 있게 코드 변경
  // useState 안에 함수 넣어 변경 가능
  const [counter, setCounter] = React.useState(() => { return jsonLocalStorage.getItem("counter") });
  const [mainCat, setMainCat] = React.useState(CAT1);
  // const [favorites, setFavorites] = React.useState(jsonLocalStorage.getItem('favorites') || []);  // 로컬스토리지에 저장된 배열이 없으면 빈 배열 저장
  const [favorites, setFavorites] = React.useState(() => { return jsonLocalStorage.getItem('favorites') || [] });
  const alreadyFavorite = favorites.includes(mainCat);

  // 메인고양이(초기 고양이) 변경
  async function setInitialCat() {
    const newCat = await fetchCat('First cat');
    setMainCat(newCat);
  }

  // 새로 그릴 때 마다 불리어진다.
  React.useEffect(() => {
    setInitialCat();
  }, [])

  async function updateMainCat(value) {
    // api로 받아온 고양이를 넣자
    const newCat = await fetchCat(value);
    setMainCat(newCat);
    // const nextCounter = prev + 1;
    // setCounter(nextCounter);

    // 문제점은 연속으로 빠르게 클릭할 경우 counter값이 제대로 올라가지 않는다.
    // 문제점 보안)        
    // setCounter를 변경하기 전 기본값을 함수 첫번째 인자로 들고 올 수 있다.
    setCounter((prev) => {
      // 폼 전송될 때마다 1씩 숫자 증가
      const nextCounter = prev + 1;
      jsonLocalStorage.setItem("counter", nextCounter);
      return nextCounter;
    })

  }

  //하트 버튼을 눌렀을 때 호출될 함수
  //handle ~ 뫄뫄로 이름을 짓는게 관례임
  function handleHeartClick() {
    const nextFavorites = [...favorites, mainCat];
    // [..., '신규값'] : 자바스크립트 문법) 기존 배열에 새로운 값 추가
    setFavorites(nextFavorites);
    jsonLocalStorage.setItem('favorites', nextFavorites);
  }

  const counterTitle = counter === null ? "" : counter + "번째 ";

  return (
    <div>
      <Title>{counterTitle}고양이 가라사대</Title>
      <Form updateMainCat={updateMainCat} />
      <MainCard
        img={mainCat}
        onHeartClick={handleHeartClick}
        alreadyFavorite={alreadyFavorite} />
      <Favorites favorites={favorites} />
    </div>
  );
};

export default App;
