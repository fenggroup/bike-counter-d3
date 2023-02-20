import pandas as pd

filename = 'counter-data-annarbor-2022.csv'

filepath = '../' + filename

df = pd.read_csv(filepath)

df['datetime'] = pd.to_datetime(df['date'])

df = df.set_index('datetime')

def resample_func(rule, filename):

    df_resampled = df.resample(rule).sum()
    df_resampled['index'] = df_resampled.index.map(str)
    df_resampled.set_index('index', inplace=True)
    df_resampled.to_csv('./counter-data-' + filename + '.csv')

resample_func('15T', '15min')
resample_func('30T', '30min')
resample_func('H', '1hour')
resample_func('D', '1day')
resample_func('W', '1week')
resample_func('M', '1month')