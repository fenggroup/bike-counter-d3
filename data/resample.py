import pandas as pd

# filename = 'counter-data-annarbor-2022.csv'
filename = 'counter-data-dearborn-2022.csv'

filepath = './data/' + filename

df = pd.read_csv(filepath)

df['date'] = pd.to_datetime(df['date'])

df = df.set_index('date')

def resample_func(rule, filename):

    df_resampled = df.resample(rule).sum()
    df_resampled['date'] = df_resampled.index.map(str)
    df_resampled.set_index('date', inplace=True)
    # df_resampled.to_csv('./data/counter-data-resampled/annarbor-2022/counter-data-' + filename + '.csv')
    df_resampled.to_csv('./data/counter-data-resampled/dearborn-2022/counter-data-' + filename + '.csv')
    
resample_func('15T', '15min')
resample_func('30T', '30min')
resample_func('H', '1hour')
resample_func('D', '1day')
resample_func('W', '1week')
resample_func('M', '1month')