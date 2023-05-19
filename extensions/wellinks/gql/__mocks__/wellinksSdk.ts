export const mockGetSdkReturn = {
    getChartingItems: jest.fn((args) => {
        return { data: { 
            // chartingItems: null
         }}
    }),
    getScheduledAppointments: jest.fn((args) => {
        return { 
            data: {

            }
        }
    })
}

export const mockGetSdk = (params: any): any => {
    return mockGetSdkReturn
}

export const getSdk = jest.fn(mockGetSdk)