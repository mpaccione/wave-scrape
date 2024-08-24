const { join } = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

class reportsByAccount {
  constructor() {
    this.generateReport = ({ account, chartData, type }) => {
      const height = 600;
      const width = 800;
      const canvasRenderService = new ChartJSNodeCanvas({ backgroundColour: 'white', height, width });

      const configuration = type === 'bar' ? {
        type: 'bar',
        data: chartData,
        options: {
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  return `${this.account}: ${data.monthly} / ${data.annual}`;
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
                text: 'USD',
              },
            },
          },
        },
      } : {
        type: 'scatter',
        data: chartData,
        options: {
          scales: {
            x: {
              type: 'linear',
              position: 'bottom'
            }
          }
        }
      };

      try {
        canvasRenderService.renderToBuffer(configuration).then(image => {
          fs.writeFileSync(`./output/2023/${this.result.data?.account}.jpg`, image);
          console.log(`${this.result.data.account} chart generated successfully`);
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

    console.log(this.result)
  }

  async generateAggregateReport() {

  }

  async generateIndividualReports() {
    fs.readdirSync(this.dir).forEach(f => {

      const filePath = join(this.dir, f);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const chartData = {
        labels: [...Object.keys(data.expense), ...Object.keys(data.income)],
        datasets: [{
          label: 'USD',
          data: [...Object.values(data.expense), ...Object.values(data.income)],
          backgroundColor: function (ctx) {
            const val = ctx.raw;
            return val >= 0 ? '#52c41a' : '#f5222d'
          }
        }],
      };
      this.generateReport({ account: data.account, chartData, type: 'scatter' })
    })
  }
}

(function () {
  const reports = new reportsByAccount
  reports.generateAggregateReport();
  reports.generateIndividualReports();
})();




