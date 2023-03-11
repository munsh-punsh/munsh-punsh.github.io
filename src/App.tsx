import React, { ChangeEvent, useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import './App.css';

type State = {
  circle: number | null;
  square: number[] | null[];
};

type Settings = {
  basePriceCircle: number;
  kCircle: {
    base: number;
    '40': number;
    '50': number;
    '60': number;
    '70': number;
    '80': number;
  };
  basePriceSquare: number;
  kSquare: {
    base: number;
    '40': number;
    '50': number;
    '60': number;
    '70': number;
    '80': number;
  };
};

function Wrapper() {
  const [Settings, setSettings] = useState<Settings | null>(null);
  const basePriceCircle = Settings && Settings.basePriceCircle / 706;
  const basePriceSquare = Settings && Settings.basePriceSquare / 900;

  function getCirclePrice(d: number | null) {
    if (!d) {
      return;
    }
    let k: string | number = Math.floor(d / 10) * 10;

    if (k > 80) {
      k = '80';
    }

    return (
      Math.floor(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ((d / 2) * (d / 2) * 3.14 * basePriceCircle * Settings.kCircle[String(k)]) / 100
      ) * 100
    );
  }

  function getSquarePrice(w: number | null, h: number | null) {
    if (!w || !h) {
      return;
    }
    const d = Math.max(w, h);

    let k: string | number = Math.floor(d / 10) * 10;

    if (k > 80) {
      k = '80';
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Math.floor((w * h * basePriceSquare * Settings.kSquare[String(k)]) / 100) * 100;
  }

  useEffect(() => {
    fetch('/settings.json')
      .then((r) => r.json())
      .then((r) => setSettings(r));
  }, []);

  if (Settings === null) {
    return null;
  }

  return <AppContainer getCirclePrice={getCirclePrice} getSquarePrice={getSquarePrice} />;
}

function getInitialState(): State {
  return {
    circle: null,
    square: [null, null],
  };
}

function AppContainer({
  getCirclePrice,
  getSquarePrice,
}: {
  getCirclePrice: (d: number | null) => number | undefined;
  getSquarePrice: (w: number | null, h: number | null) => number | undefined;
}) {
  const [state, setState] = useState(getInitialState());
  const circleValid = typeof state.circle === 'number' && state.circle >= 30;
  const squareValid =
    typeof state.square[0] === 'number' &&
    typeof state.square[1] === 'number' &&
    state.square[0] >= 30 &&
    state.square[1] >= 30;
  const handleChangeCircle = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    const name = event.currentTarget.name;

    setState((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleChangeSquare = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    const [name, index] = event.currentTarget.name.split('|');

    setState((prev) => {
      const squareArray = [...prev.square];
      squareArray[Number(index)] = Number(value);

      return { ...prev, [name]: squareArray };
    });
  };

  return (
    <div className="App">
      <h1>Расчёт стоимости круглой картины</h1>
      <p>
        Диаметр круглой картины должен быть <b>не меньше 30см</b>
      </p>
      <NumericFormat
        allowNegative={false}
        name="circle"
        value={state.circle}
        onChange={handleChangeCircle}
        placeholder="Введите диаметр"
      />
      <div className="circlePrice price">
        {circleValid && (
          <>
            Стоимость картины диаметром <b>{state.circle}см</b>
            <br />
            <b>{getCirclePrice(state.circle)} рублей</b>
          </>
        )}
      </div>
      <h1>Расчёт квадратной картины</h1>
      <p>
        Ширина и длина картины должны быть <b>не меньше 30см</b>
      </p>
      <NumericFormat
        allowNegative={false}
        name="square|0"
        value={state.square[0]}
        onChange={handleChangeSquare}
        placeholder="Введите ширину"
      />
      <br />
      <NumericFormat
        allowNegative={false}
        name="square|1"
        value={state.square[1]}
        onChange={handleChangeSquare}
        placeholder="Введите длину"
      />
      <div className="squarePrice price">
        {squareValid && (
          <>
            Стоимость картины{' '}
            <b>
              {state.square[0]}см x {state.square[1]}см
            </b>
            <br />
            <b>{getSquarePrice(state.square[0], state.square[1])} рублей</b>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  return <Wrapper />;
}

export default App;
