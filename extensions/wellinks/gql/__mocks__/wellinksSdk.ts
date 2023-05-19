export const mockGetSdkReturn = {
    getChartingItems: jest.fn((args) => {
        return { data: { 
            // chartingItems: null
         }}
    })
}

export const mockGetSdk = (params: any): any => {
    return mockGetSdkReturn
}

export const getSdk = jest.fn(mockGetSdk)