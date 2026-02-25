import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-usermanual',
    templateUrl: './usermanual.component.html',
    styleUrls: ['./usermanual.component.scss']
})
export class UsermanualComponent implements OnInit {
  tabs = [
    { 
        label: 'Dashboard', 
        videos: [
            { 
                url: 'https://shipeasy.blob.core.windows.net/tutorial-video/Dashboard.mp4', 
                header: 'ShipEasy Dashboard', 
                description: 'In this tutorial, I will walk you through the ShipEasy Dashboard, showing you how to manage orders, track shipments, and optimize your shipping process effortlessly. Whether youa re a beginner or an experienced seller this guide will help you get the most out of ShipEasy. ' 
            }
        ] 
    },
    { 
        label: 'Rate finder', 
        videos: [
            { 
                url: 'https://shipeasy.blob.core.windows.net/tutorial-video/RateFinder .mp4', 
                header: 'Rate Finder', 
                description: 'In this tutorial, I will walk you through RateFinder, the ultimate tool for comparing shipping rates and saving money on every shipment. Learn how to quickly find the best carriers, optimize costs, and streamline your shipping process.' 
            }
        ] 
    },
    { 
      label: ' New Inquiry creation', 
      videos: [
          { 
              url: 'https://shipeasy.blob.core.windows.net/tutorial-video/New inquiry.mp4', 
              header: 'New Inquiry creation', 
              description: 'In this tutorial, I will guide you through the New Inquiry feature, showing you how to handle customer inquiries efficiently. Learn how to track requests, respond quickly, and keep your shipping process smooth.' 
          }
      ] 
  },
  { 
    label: 'Inquiry Quotations', 
    videos: [
        { 
            url: 'https://shipeasy.blob.core.windows.net/tutorial-video/Quotation.mp4', 
            header: 'Inquiry Quotations', 
            description: 'In this tutorial, I will show you how to use the Inquiry Quotation feature to create accurate shipping quotes for your customers. Learn how to streamline the process, provide competitive pricing, and improve customer satisfaction.' 
        }
    ] 
},
{ 
  label: 'Job', 
  videos: [
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/job .mp4',
      header: 'Job Management',
      description: 'In this tutorial, I will guide you through the Job feature, showing you how to create, track, and manage shipping jobs with ease. Learn how to streamline your workflow and keep your shipping operations running smoothly.'
    },
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/shipping-instruction.mp4',
      header: 'Shipping Instruction ',
      description: ' In this tutorial, I will show you how to use the Shipping Instruction feature to provide clear and precise shipping details. Learn how to avoid delays, reduce errors, and streamline your shipping process effortlessly.'
    },
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/Container.mp4',
      header: 'Container',
      description: 'In this tutorial, I will guide you through the Container feature, showing you how to track, manage, and optimize your container shipments with ease. Stay organized and ensure smooth shipping operations.'
    },
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/Route and Destination Details - Made with Clipchamp.mp4',
      header: 'Route & Destination',
      description: 'In this tutorial, I will walk you through the Route & Destination Details feature, helping you set up accurate shipping routes and destinations. Learn how to optimize delivery efficiency and avoid delays'
    },
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/BL - Made with Clipchamp.mp4',
      header: 'Bill Of Lading',
      description: 'In this tutorial, I will show you how to use the Bill of Lading feature to generate, manage, and share accurate shipping documents. Ensure smooth freight handling and compliance with ease.'
    },
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/Charges.mp4',
      header: ' Charges',
      description: 'In this tutorial, I will walk you through the Charges feature, showing you how to calculate, track, and manage shipping costs efficiently. Learn how to ensure accurate billing and keep your finances in check.'
    },
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/Custom.mp4',
      header: ' Customs',
      description: 'In this tutorial, I will walk you through the Customs feature, showing you how to manage declarations, ensure compliance, and streamline the customs clearance process. Avoid delays and ship with confidence.'
    },
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/Documents tab.mp4',
      header: 'Documents',
      description: 'In this tutorial, I will walk you through the Documents Tab, showing you how to upload, store, and manage essential shipping documents in one place. Keep your paperwork organized and ensure smooth shipping operations!'
    }
  ]
},
{ 
  label: 'Finance', 
  videos: [
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/Purchase & payment out .mp4',
      header: 'Purchase & Payment out Tutorial',
      description: 'In this tutorial, I will walk you through the Purchase & Payment out feature, showing you how to record purchases, track payments, and manage your financial transactions seamlessly. Keep your shipping finances organized and hassle-free! '
    },
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/sale & payment is.mp4',
      header: 'Sale & Payment In',
      description: 'In this tutorial, I will walk you through the Sale & Payment In feature, showing you how to record sales, track incoming payments, and manage your transactions effortlessly. Keep your finances organized and ensure smooth business operations!'
    },
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/Credit_debit note .mp4',
      header: 'Credit & Debit Note Tutorial',
      description: 'In this tutorial, I will walk you through the Credit & Debit Note feature, showing you how to issue, manage, and track credit and debit notes for your transactions. Learn how to handle adjustments smoothly and maintain accurate financial records!'
    },
    {
      url: 'https://shipeasy.blob.core.windows.net/tutorial-video/TDS & Profit and Loss.mp4',
      header: 'TDS Account & Profit & Loss Statement Tutorial',
      description: 'This tutorial covers the TDS Account feature—helping you calculate, track, and manage Tax Deducted at Source (TDS) accurately. Stay compliant with ease! You will also learn to analyze your Profit & Loss Statement, gaining insights into revenue, expenses, and overall financial health to improve profitability.'
    }
  ]
},
{ 
  label: 'Chat modules', 
  videos: [
      { 
          url: 'https://shipeasy.blob.core.windows.net/tutorial-video/chat.mp4', 
          header: 'Chat Module ', 
          description: 'In this tutorial, I will walk you through the Chat Module, showing you how to send messages, collaborate with your team, and stay updated on shipping operations in real time. Improve communication and boost efficiency! ' 
      }
  ] 
},
{ 
  label: 'Customer interface', 
  videos: [
      { 
          url: 'https://shipeasy.blob.core.windows.net/tutorial-video/customer.mp4', 
          header: 'Customer Interface', 
          description: 'In this tutorial, I will walk you through the Customer Interface, showing you how customers can track shipments, view quotes, place inquiries, and interact with your services seamlessly. Improve customer satisfaction with a smooth and user-friendly experience! ' 
      }
  ] 
}

];

    selectedTab = this.tabs[0];

    isModalOpen = false;
    currentVideoUrl: string = '';
    sanitizedVideoUrl: SafeResourceUrl = '';
    videoTitle: string;

    constructor(private sanitizer: DomSanitizer) { }

    ngOnInit(): void { }

    selectTab(tab: any) {
        this.selectedTab = tab;
    }
    openModal(videoUrl: string, title: string) {
      this.currentVideoUrl = videoUrl;
      this.videoTitle = this.selectedTab.videos.find(video => video.url === videoUrl)?.header || '';
      this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl.replace('watch?v=', 'embed/'));
      this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.sanitizedVideoUrl = '';
    }

    getYouTubeID(url: string): string {
        return url.split('v=')[1]?.split('&')[0] || '';
    }

    
  
}
