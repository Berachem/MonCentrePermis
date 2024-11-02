import os
import pandas as pd
import json

# Paths to files
csv_file_path = os.path.join(os.getcwd(), 'data/UK_city.csv')
json_exam_file_path = os.path.join(os.getcwd(), 'data/centres_examens.json')
output_json_path = os.path.join(os.getcwd(), 'data/ville_en.json')

# Load the centres_examens JSON file to get a list of unique cities
with open(json_exam_file_path, 'r', encoding='utf-8') as f:
    exam_data = json.load(f)

# Extract unique cities from the centres_examens data
exam_cities = {entry['formattedAddress']['city'] for entry in exam_data['centres_examens']}

# Load the CSV file into a DataFrame
df = pd.read_csv(csv_file_path, low_memory=False)

# Filter the relevant columns
df_filtered = df[['PlaceName', 'Lat', 'Lng', 'Region']]

# Filter to include only rows with Region 'England' and cities present in exam_cities
df_filtered = df_filtered[(df_filtered['Region'] == 'England') & (df_filtered['PlaceName'].isin(exam_cities))]

# Rename columns for JSON clarity
df_filtered = df_filtered.rename(columns={
    'PlaceName': 'city',
    'Lat': 'lat',
    'Lng': 'lng',
    'Region': 'region'
})

# Convert all values to strings
df_filtered = df_filtered.astype(str)

# Convert DataFrame to a list of dictionaries
city_data = df_filtered.to_dict(orient='records')

# Write the output to a JSON file
with open(output_json_path, 'w', encoding='utf-8') as json_file:
    json.dump(city_data, json_file, ensure_ascii=False, indent=4)

print(f"Filtered JSON file saved at: {output_json_path}")
