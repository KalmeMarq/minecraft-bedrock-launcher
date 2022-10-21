const SystemRequirements: React.FC = () => {
  return (
    <div className="system-requirements">
      <h3>System Requirements</h3>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Minimum Requirements:</th>
            <th>Recommended Requirements:</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>OS</td>
            <td>Windows 10 version 14393.0 or higher</td>
            <td>Windows 10 version 14393.0 or higher</td>
          </tr>
          <tr>
            <td>Architecture</td>
            <td>ARM, x64, x86</td>
            <td>ARM, x64, x86</td>
          </tr>
          <tr>
            <td>Memory</td>
            <td>4 GB</td>
            <td>8 GB</td>
          </tr>
          <tr>
            <td>Motion Controller</td>
            <td>Not specified</td>
            <td>Windows Mixed Reality motion controllers</td>
          </tr>
          <tr>
            <td>Headset</td>
            <td>Not specified</td>
            <td>Windows Mixed Reality immersive headset</td>
          </tr>
          <tr>
            <td>Processor</td>
            <td>Intel Celeron J4105 | AMD FX-4100</td>
            <td>Intel i7-6500U | AMD A8-6600K</td>
          </tr>
          <tr>
            <td>Graphics</td>
            <td>Intel HD Graphics 4000 | AMD Radeon RS</td>
            <td>NVIDIA GeForce 940M | AMD Radeon HD 8570D</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SystemRequirements;
