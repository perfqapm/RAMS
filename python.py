import matplotlib.pyplot as plt
import csv

# Path to the CSV file
csv_file_path = './data.csv'

# Read CSV file and extract data
labels = []
sizes = []
with open(csv_file_path, 'r') as csv_file:
    csv_reader = csv.reader(csv_file)
    next(csv_reader)  # Skip header row
    for row in csv_reader:
        labels.append(row[0])
        sizes.append(float(row[1]))

# Create pie chart
plt.figure(figsize=(10, 8))
plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140)
plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
plt.title('Your Pie Chart Title')
plt.savefig('pie_chart.png')  # Save the chart as a PNG file
plt.show()  # Display the chart
