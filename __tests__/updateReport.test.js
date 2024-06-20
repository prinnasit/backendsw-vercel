const {updateReport} = require('../controllers/functionForTest');
const Report = require("../models/Report");

// Mocking the Report model methods
jest.mock("../models/Report");


describe('updateReport function', () => {
    it('report not found status 400', async () => {
      
      const bodyForUpdate = {
        treatment: "Updated Treatment",
        prescribed_medication: "Updated Medication",
        recommendations: "Updated Recommendations",
    };
    
    const req = {
        user: { userType: "dentist", id: "12351235123" },
        params: { id: "51232353512" },
        body: bodyForUpdate
    };
    
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Mocking the findById method of the Report model
        Report.findById.mockResolvedValue(null);

        await updateReport(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false });
    });

    // Test case for successful report update
    it('updated report successful status 200', async () => {
      const bodyForUpdate = {
        treatment: "Updated Treatment",
        prescribed_medication: "Updated Medication",
        recommendations: "Updated Recommendations",
    };
    
    const req = {
        user: { userType: "dentist", id: "234623462346" },
        params: { id: "12344567" },
        body: bodyForUpdate
    };
    const updatedReport = {
      _id: "12344567", // Assuming the ID of the updated report
      patientId: "14363462346", // Assuming the ID of the patient associated with the report
      dentistId: "234623462346", // Assuming the ID of the dentist associated with the report
      appointmentId: "2623462346", // Assuming the ID of the appointment associated with the report
      treatment: "Treatment",
      prescribed_medication: "Medication",
      recommendations: "Recommendations",
      date: new Date(), 
    };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Mocking the findById method of the Report model to return a report
        Report.findById.mockResolvedValueOnce({
            dentistId: "234623462346",
            // Other properties of the report
        });

        // Mocking the findByIdAndUpdate method of the Report model to return the updated report
        Report.findByIdAndUpdate.mockResolvedValueOnce(updatedReport);

        await updateReport(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedReport });
    });

    // Test case for unauthorized access
    it('not authorized status 401', async () => {
      const bodyForUpdate = {
        treatment: "Updated Treatment",
        prescribed_medication: "Updated Medication",
        recommendations: "Updated Recommendations",
    };
    
    const req = {
        user: { userType: "patient", id: "54532345132" },
        params: { id: "1235123553" },
        body: bodyForUpdate
    };
    
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Mocking the findById method of the Report model to return a report
        Report.findById.mockResolvedValueOnce({
            dentistId: "54532345132",
            // Other properties of the report
        });

        await updateReport(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "You are not authorized to update this report" });
    });

    it("not dentist's report status 401", async () => {
        const bodyForUpdate = {
          treatment: "Updated Treatment",
          prescribed_medication: "Updated Medication",
          recommendations: "Updated Recommendations",
      };
      
      const req = {
          user: { userType: "dentist", id: "54532345133" },
          params: { id: "1235123553" },
          body: bodyForUpdate
      };
      
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn()
          };
  
          // Mocking the findById method of the Report model to return a report
          Report.findById.mockResolvedValueOnce({
              dentistId: "54532345132",
              // Other properties of the report
          });
  
          await updateReport(req, res);
  
          expect(res.status).toHaveBeenCalledWith(401);
          expect(res.json).toHaveBeenCalledWith({ success: false, message: "You are not authorized to update this report" });
      });

      it("error status 400", async () => {

        const bodyForUpdate = {
            treatment: "Updated Treatment",
            prescribed_medication: "Updated Medication",
            recommendations: "Updated Recommendations",
        };
        
      const req = {
          user: { userType: "dentist", id: "54532345132" },
          params: { id: "1235123553" },
          body: bodyForUpdate
      };
      
          const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn()
          };
  
          
          

          Report.findById.mockResolvedValueOnce({
            dentistId: "54532345132",
            // Other properties of the report
        });

        Report.findByIdAndUpdate.mockRejectedValueOnce(new Error());
  
          await updateReport(req, res);
  
          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({ success: false});
      });
});
