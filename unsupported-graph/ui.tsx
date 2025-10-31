import { FC } from 'react';
import styles from './styles.module.scss';

type Props = {
  message?: string;
};

export const UnsupportedGraph: FC<Props> = ({
  message = 'Данный тип графика не предусмотрен для выбранного объекта',
}) => {
  return (
    <div className={styles.noDataContainer}>
      <div className={styles.noDataMessage}>{message}</div>
    </div>
  );
};
