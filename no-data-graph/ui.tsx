import styles from './styles.module.scss';

type TNoDataGraph = { isLoading: boolean };

export const NoDataGraph = ({ isLoading }: TNoDataGraph) => {
  return (
    <div className={styles.noDataContainer}>
      <div className={styles.noDataMessage}>
        {isLoading ? 'Загрузка данных...' : 'Нет данных'}
      </div>
    </div>
  );
};
