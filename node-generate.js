const { join } = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

class reportsByAccount {
  constructor() {
    this.getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
      this.getCurrencyFormat = (val) => {
        return val.toLocaleString(
          'en-US',
          {
            style: 'currency',
            currency: 'USD',
          }
        ).trim()
      }

    this.generateReport = ({ account, chartData, path, type }) => {
      const height = 720;
      const width = 1080;
      const canvasRenderService = new ChartJSNodeCanvas({ backgroundColour: 'white', height, width });

      const configuration = type === 'bar' ? {
        type: 'bar',
        data: chartData,
        options: {
          layout: {
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        },
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  return `${account}: ${data.monthly} / ${data.annual}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Category',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Value',
              },
              ticks: {
                maxTicksLimit: 24 // increase tick count to double the number of ticks
              }
            },
          },
        },
      } : {
        type: 'line',
        data: chartData,
        options: {
          layout: {
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        },
          plugins: {
            legend: {
              labels: {
                boxWidth: 20,
                boxHeight: 20,
                usePointStyle: true
              }
            }
          },
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Category'
              },
            },
            y: {
              title: {
                display: true,
                text: 'Value'
              },
              ticks: {
                maxTicksLimit: 36 // increase tick count to double the number of ticks
              }
            }
          }
        }
      };

      try {
        canvasRenderService.renderToBuffer(configuration).then(image => {
          fs.writeFileSync(`./${path}/${account}.jpg`, image);
          console.log(`${account} chart generated successfully`);
        })
      } catch (error) {
        console.error('Error generating chart image:', error);
      }
    }

    const readJsonFiles = (dir) => {
      const files = fs.readdirSync(dir);
      const fileDataArray = [];

      files.forEach(file => {
        const filePath = join(dir, file);
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        fileDataArray.push({ fileName: file, data: fileData });
      });

      return fileDataArray;
    }

    this.dir = `${__dirname}/data/2023`;
    this.result = readJsonFiles(this.dir);
  }

  async generateCombinedReport() {
    const data = [];
    const labels = [];

    fs.readdirSync(this.dir).forEach(f => {
      const filePath = join(this.dir, f);
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      data.push(fileData)

      // get unique category keys
      const labelObj = {}

      // values for flexibility
      Object.keys(fileData.expense).forEach(k => labelObj[k] = 'expense')
      Object.keys(fileData.income).forEach(k => labelObj[k] = 'income')

      labels.push(labelObj)
    })

    const combinedData = {}
    const dataKeys = ['expense', 'income']

    // sum values
    dataKeys.forEach((type => {
      data.forEach(d => Object.entries(d[type]).forEach(([key, val]) => {
        if (!combinedData.hasOwnProperty(type)) {
          combinedData[type] = {}
        }

        if (!combinedData[type].hasOwnProperty(key)) {
          combinedData[type][key] = 0;
        }

        combinedData[type][key] += parseFloat(val)
      })
      )
    }))

    const chartData = {
      labels: [...Object.keys(combinedData.expense), ...Object.keys(combinedData.income)],
      datasets: [{
        label: `Portfolio: ${this.getCurrencyFormat(data.map(d => d.monthly).reduce((acc, curr) => acc + curr, 0))
          } M | ${this.getCurrencyFormat(data.map(d => d.annual).reduce((acc, curr) => acc + curr, 0))} YR`,
        data: [...Object.values(combinedData.expense), ...Object.values(combinedData.income)],
        backgroundColor: function (ctx) {
          const val = ctx.raw;
          return val >= 0 ? '#52c41a' : '#f5222d'
        }
      }],
    };

    this.generateReport({ account: 'combined_2023', chartData, path: 'output', type: 'bar' })
  }

  async generateIndividualReports() {
    fs.readdirSync(this.dir).forEach(f => {
      const filePath = join(this.dir, f);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const chartData = {
        labels: [...Object.keys(data.expense), ...Object.keys(data.income)],
        datasets: [{
          label: `${data.account.split('-')[0].trim()}: ${this.getCurrencyFormat(data.monthly)} M | ${this.getCurrencyFormat(data.annual)} YR`,
          data: [...Object.values(data.expense), ...Object.values(data.income)],
          backgroundColor: function (ctx) {
            const val = ctx.raw;
            return val >= 0 ? '#52c41a' : '#f5222d'
          }
        }],
      };

      this.generateReport({ account: data.account, chartData, path: 'output/2023', type: 'bar' })
    })
  }

  async generateComparisonReport() {
    const chartData = {
      labels: [],
      datasets: [],
    };
    const colorData = {}

    fs.readdirSync(this.dir).forEach(f => {
      const filePath = join(this.dir, f);
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // set colors by account
      if (!colorData.hasOwnProperty(fileData.account)) {
        colorData[fileData.account] = this.getRandomColor();
      }

      const fileLabels = [...Object.keys(fileData.expense), ...Object.keys(fileData.income)]

      chartData.labels = fileLabels
      chartData.datasets.push({
        borderColor: 'transparent',
        label: fileData.account.split('-')[0].trim(),
        data: [...Object.values(fileData.expense), ...Object.values(fileData.income)].map((d, idx) => { return { x: chartData.labels[idx], y: d } }), fill: false, pointRadius: 6, pointBackgroundColor: colorData[fileData.account]
      })

    })

    this.generateReport({ account: 'comparison_2023', chartData, path: 'output', type: 'line' })
  }
}

(function () {
  const reports = new reportsByAccount
  reports.generateCombinedReport();
  reports.generateIndividualReports();
  reports.generateComparisonReport();
})();




