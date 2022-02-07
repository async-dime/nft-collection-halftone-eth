import useCountDown from '../hooks/useCountDown';
import styles from '../styles/Home.module.css';
import cx from 'classnames';

const DateTimeDisplay = ({ value, type, isDanger }) => {
  return (
    <div
      className={
        isDanger
          ? `${cx(styles.countdown, styles.danger)}`
          : `${styles.countdown}`
      }
    >
      <p>{value}</p>
      <span>{type}</span>
    </div>
  );
};

const ShowCounter = ({ days, hours, minutes, seconds }) => {
  const timeAlert = days <= 1 && hours <= 12 && minutes <= 60;
  return (
    <div className={styles.showCounter}>
      <div className={styles.countdown}>Presale countdown: </div>
      <DateTimeDisplay value={days} type={'Days'} isDanger={days <= 3} />
      <p className={styles.countdown}>:</p>
      <DateTimeDisplay value={hours} type={'Hours'} isDanger={timeAlert} />
      <p className={styles.countdown}>:</p>
      <DateTimeDisplay value={minutes} type={'Mins'} isDanger={timeAlert} />
      <p className={styles.countdown}>:</p>
      <DateTimeDisplay value={seconds} type={'Seconds'} isDanger={timeAlert} />
    </div>
  );
};

const CountDownTimer = ({ targetDate }) => {
  const [days, hours, minutes, seconds] = useCountDown(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    return null;
  } else {
    return (
      <ShowCounter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    );
  }
};

export default CountDownTimer;
