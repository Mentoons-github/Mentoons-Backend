const ProductEmailTemplate = (order) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="max-width: 180px; height: auto;"/>
      </div>

      <div style="text-align: center; margin-bottom: 35px;">
        <h1 style="color: #2D3748; font-size: 24px; font-weight: 600; margin: 0;">
          Purchase Confirmation
        </h1>
        <p style="color: #718096; font-size: 16px; margin-top: 8px;">
          Thank you for your purchase, ${order?.customerName}
        </p>
      </div>

      <div style="background-color: #F7FAFC; border-radius: 6px; padding: 25px; margin-bottom: 30px;">
        <h2 style="color: #2D3748; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
          Order Details
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #4A5568; font-size: 15px;">Product</td>
            <td style="padding: 12px 0; color: #2D3748; font-size: 15px; text-align: right;">${order?.products
              ?.map((item) => item.title)
              .join(", ")}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #4A5568; font-size: 15px;">Email</td>
            <td style="padding: 12px 0; color: #2D3748; font-size: 15px; text-align: right;">${
              order.email
            }</td>
          </tr>
        </table>
      </div>

      <div style="display: block; margin-bottom: 20px;">
        <h1 style="display: block; text-align: center">Products</h1>
        <div
          style="
            display: block;
          
          "
        >
        ${order.products.map((product) => {
          return ` <div
            style="display: flex; align-items: start; justify-content: start; width: 100%;"
          >
            <div>
              <img
                src=${product.productImages[0]?.imageUrl}
                alt=${product.title}
                style="
                  display: block;
                  width: 120px;
                  height: 120px;
                  object-fit: cover;
                  
                "
              />
            </div>
            <div style="display: flex; flex-direction: column;  ">
            <p style="text-align: start; margin:0px; font-size: large; font-weight: 800; text-transform: capitalize; margin-inline-start:16px ;">${product.title}</p>
            <a href=${product.orignalProductSrc} style="display: inline-block;  margin-inline-start: 16px; background-color:#e39712; padding-inline:20px; padding-block: 12px; border-radius: 12px; text-decoration: none; color: #fff; font-weight: 800; width: 100px; text-align: center; margin-top: 12px;"> Download </a>
            </div>

          </div>`;
        })}
        </div>
      </div>

      <div style="margin-bottom: 35px;">
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6; margin: 0;">
          We're delighted to confirm your purchase. You'll receive access to your product shortly. If you have any questions, our support team is here to help.
        </p>
      </div>

      <div style="border-top: 1px solid #E2E8F0; padding-top: 25px;">
        <div style="text-align: center;">
          <p style="color: #718096; font-size: 14px; margin: 0 0 15px 0;">
            Need assistance? Contact our support team
          </p>
          <a href="mailto:metalmahesh@gmail.com" style="color: #4299E1; text-decoration: none; font-size: 14px;">
            metalmahesh@gmail.com
          </a>
        </div>
      </div>
    </div>
  `;
};

const WelcomeEmailTemplate = (email, data) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 30px; position: relative; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <div style="text-align: center; margin-bottom: 25px;">
            <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="max-width: 120px; height: auto;"/>
        </div>
        
        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 25px; ">
            <div style="background: #FFE5D4; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <h1 style="color: #FF6B35; text-align: center; font-size: 24px; margin: 0; font-weight: 600;">
                    🎉 Welcome to Mentoons! 🎉
                </h1>
            </div>
            <p style="color: #6c757d; font-size: 16px; text-align: center; margin: 15px 0; line-height: 1.6;">
                Thank you for joining us! 🌟 Your complimentary PDF is ready for download below.
            </p>
        </div>

        <div style="text-align: center; background-color: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 25px; position: relative;">
            <!-- Decorative ribbon -->
            
            
            <a href="${data.pdf}" download style="display: inline-block; text-decoration: none;">
                <img src="${data.thumbnail}" alt="PDF Thumbnail" style="max-width: 50%; height: auto; border: 3px solid #FF6B35; border-radius: 8px; box-shadow: 0 4px 15px rgba(255,107,53,0.2); transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" />
            </a>
        </div>

        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; text-align: center; border: 2px solid #FFE5D4;">
            <p style="color: #FF6B35; font-size: 16px; margin: 0;">
                ✨ We hope you enjoy your magical reading experience with Mentoons! ✨
            </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
            <p style="color: #adb5bd; font-size: 12px; margin: 0;">
                © 2025 Mentoons. All rights reserved. 🌟
            </p>
        </div>

        <style>
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
        </style>
    </div>
  `;
};

const SubscriptionEmailTemplate = (order) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF6B35 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="width: 120px; margin-bottom: 20px;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to Premium!</h1>
      </div>

      <div style="padding: 40px 30px;">
        <div style="background-color: #F3F4F6; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
          <h2 style="color: #1F2937; font-size: 20px; margin: 0 0 15px 0;">Subscription Details</h2>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0;">
            <strong>Name:</strong> ${order.customerName}<br>
            <strong>Email:</strong> ${order.email}<br>
            
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <p style="color: #1F2937; font-size: 16px; line-height: 1.6;">
            Your premium content is ready! Click below to access your materials:
          </p>
          <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
            <img src="${thumbnail}" alt="Content Preview" style="max-width: 300px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          </a>
        </div>

        <div style="border-top: 1px solid #E5E7EB; padding-top: 30px;">
          <h3 style="color: #1F2937; font-size: 18px; margin: 0 0 15px 0;">What's Next?</h3>
          <ul style="color: #4B5563; font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li>Explore your premium dashboard</li>
            <li>Access exclusive content</li>
            <li>Join our community discussions</li>
            <li>Get priority support</li>
          </ul>
        </div>
      </div>

      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="color: #6B7280; font-size: 14px; margin: 0;">
          Need help? Contact us at metalmahesh@gmail.com<br>
          Follow us on social media @mentoons
        </p>
      </div>
    </div>
  </div>
  `;
};

const AssessementEmailTemplate = (name, email, phone, pdf, thumbnail) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);">
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 40px 20px; text-align: center; border-radius: 15px 15px 0 0; position: relative;">
        <img src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png" alt="Mentoons Logo" style="width: 150px; margin-bottom: 20px;">
        <h1 style="color: #ffffff; font-size: 32px; margin: 0;">Your Assessment Results Are Here! 🎉</h1>
      </div>

      <!-- Main Content -->
      <div style="padding: 40px 30px;">
        <!-- Personal Greeting -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #FF6B35; font-size: 24px; margin: 0 0 15px 0;">Dear ${name},</h2>
          <p style="color: #4B5563; font-size: 18px; line-height: 1.6;">
            Thank you for completing the Mentoons Assessment! We're excited to share your personalized results and help you unlock your full potential. 🌟
          </p>
        </div>

        <!-- Assessment Report Section -->
        <div style="background-color: #FFF3EE; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h3 style="color: #FF6B35; font-size: 22px; margin: 0 0 15px 0;">📊 Your Assessment Report</h3>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We've analyzed your responses and created a comprehensive report just for you. Click below to view your detailed assessment:
          </p>
          <div style="text-align: center;">
            <a href="${pdf}" download style="display: inline-block; text-decoration: none;">
              <img src="${thumbnail}" alt="Assessment Report" style="max-width: 300px; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 8px rgba(255, 107, 53, 0.15); transition: transform 0.3s ease;">
            </a>
          </div>
        </div>

        <!-- Next Steps Section -->
        <div style="background-color: #F9FAFB; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h3 style="color: #FF6B35; font-size: 22px; margin: 0 0 15px 0;">🚀 Ready to Transform?</h3>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            Want to achieve your full potential? We're here to help! Check out our:
          </p>
          <ul style="color: #4B5563; font-size: 16px; line-height: 1.8; padding-left: 20px;">
            <li><a href="https://mentoons.com" style="color: #FF6B35; text-decoration: none;">Visit our website</a> for more resources</li>
            <li><a href="https://mentoons.com/workshops" style="color: #FF6B35; text-decoration: none;">Join our workshops</a> for hands-on learning</li>
            <li>Book a <a href="https://mentoons.com/bookings" style="color: #FF6B35; text-decoration: none;">free consultation</a> with our experts</li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div style="text-align: center; margin-top: 30px;">
          <h3 style="color: #FF6B35; font-size: 20px; margin: 0 0 15px 0;">📞 Let's Connect!</h3>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            Phone: +91 XXXXXXXXXX<br>
            Email: metalmahesh@gmail.com<br>
            Follow us: @mentoons
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #FF6B35; padding: 20px; text-align: center; border-radius: 0 0 15px 15px;">
        <p style="color: #ffffff; font-size: 14px; margin: 0;">
          © 2025 Mentoons. All rights reserved.<br>
          Helping young minds reach their full potential!
        </p>
      </div>
    </div>
  `;
};

//NOTE: Create utility function for emails instead of controllers.
const NewsletterEmailTemplate = () => {
  return `
    <div style="max-width: 95%; background-color: #f7e0c3; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div
        style="text-align: start; padding: 20px 18px; background-color: #e39712"
      >
        <img
          src="https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png"
          alt="Mentoons Logo"
          style="max-width: 180px; height: auto"
        />
      </div>

      <div
        style="
          text-align: start;
          margin-bottom: 20px;
          padding: 32px;
          padding-top: 0px;
          background-color: #e39712;
        "
      >
        <h1
          style="
            color: #ffffff;
            font-size: 32px;
            margin: 0;
            text-transform: uppercase;
            font-weight: bold;
          "
        >
          WELCOME TO
        </h1>
        <h1
          style="
            color: #ffffff;
            font-size: 32px;
            margin: 0;
            text-transform: uppercase;
            font-weight: bold;
          "
        >
          MENTOONS
        </h1>
        <h1
          style="
            color: #ffffff;
            font-size: 32px;
            margin: 0;
            text-transform: uppercase;
            font-weight: bold;
          "
        >
          NEWSLETTER
        </h1>
      </div>

      <div
        style="
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        "
      >
        <p
          style="
            color: #333333;
            font-size: 16px;
            line-height: 1.5;
            margin: 0;
            text-align: center;
          "
        >
          Greetings, Special welcome to Mentoons! As part of the Mentoons
          Newsletter, in this issue we bring you insightful articles, upcoming
          workshops, and exciting news. Stay tuned for more updates!
        </p>
        <div
          style="
            height: 4px;
            width: 30px;
            background-color: #000000;
            margin: 15px auto;
          "
        ></div>
      </div>

      <div style="margin-bottom: 20px">
        <div style="border-radius: 8px; padding: 10px; text-align: center">
          <h2 style="color: #e39712; font-size: 24px; margin: 0">
            WHAT'S NEW TODAY?
          </h2>
        </div>

        <div
          style="
            background-color: #9fe9ff;
            padding: 20px;
            margin-top: 15px;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
          "
        >
          <div style="margin-bottom: 15px">
            <img
              src="https://plus.unsplash.com/premium_photo-1717774172640-b7d9a3192c5e?q=80&w=1502&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Eclipse"
              style="width: 100%; height: auto; border-radius: 5px"
            />
          </div>
          <div>
            <h3 style="color: #333333; font-size: 18px; margin: 0 0 10px 0">
              Introducing Mentoons Mythos
            </h3>
            <p
              style="
                color: #666666;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
              "
            >
              Mentoons Mythos isn’t just about reports; it’s a thriving
              community of individuals seeking purpose, clarity, and cosmic
              guidance. Whether you’re exploring astrology, psychology, or
              career growth, our groups help you connect with like-minded people
              who share your journey.
            </p>
          </div>
        </div>

        <div
          style="
            background-color: #fe8b7d;
            padding: 20px;
            margin-top: 15px;
            display: flex;
            flex-direction: column-reverse;
            border-radius: 8px;
          "
        >
          <div>
            <h3 style="color: #333333; font-size: 18px; margin: 0 0 10px 0">
              Meet our New Psychologist: Dr. Nisha K
            </h3>
            <p
              style="
                color: #333333;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
              "
            >
              We're excited to welcome Dr. Nisha K to our team. With over 10
              years of experience in child psychology, she brings valuable
              expertise to our workshops.
            </p>
          </div>
          <div style="margin-bottom: 15px">
            <img
              src="https://plus.unsplash.com/premium_photo-1682089872205-dbbae3e4ba32?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Psychologist"
              style="width: 100%; height: auto; border-radius: 5px"
            />
          </div>
        </div>

        <div
          style="
            background-color: #fee898;
            padding: 20px;
            margin-top: 15px;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
          "
        >
          <div style="margin-bottom: 15px">
            <img
              src="https://images.unsplash.com/photo-1581041122145-9f17c04cd153?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="New Arrival"
              style="width: 100%; height: auto; border-radius: 5px"
            />
          </div>
          <div>
            <h3 style="color: #333333; font-size: 18px; margin: 0 0 10px 0">
              New Exciting Stuffs coming up for our Mentoons Fam!
            </h3>
            <p
              style="
                color: #666666;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
              "
            >
              We've got new set of product to launch soon. Stay tuned for more
              details on these engaging produc for children of all ages.
            </p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px; padding: 20px; padding-bottom: 0px">
        <div style="display: flex; align-items: center; margin-bottom: 15px">
          <div
            style="
              width: 40px;
              height: 40px;
              background-color: #ffffff;
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-right: 10px;
            "
          >
            <span style="color: #ffc107; font-weight: bold; font-size: 1.5rem"
              >📅</span
            >
          </div>
          <h2 style="color: #000000; font-size: 24px; margin: 0">
            Upcoming Events & Workshops
          </h2>
        </div>

        <div style="border-radius: 8px; padding: 15px">
          <p
            style="
              color: #666666;
              font-size: 14px;
              line-height: 1.4;
              margin: 0 0 10px 0;
            "
          >
            Join our expert-led sessions to gain personalized insights and
            career clarity based on astrology and psychology!
          </p>

          <div
            style="
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              padding-top: 15px;
            "
          >
            <div
              style="
                margin-right: 10px;
                flex-shrink: 0;
                margin-top: 2px;
                font-size: 1.5rem;
              "
            >
              🔮
            </div>
            <p
              style="
                color: #333333;
                font-size: 14px;
                line-height: 1.4;
                margin: 0;
                margin-left: 15px;
              "
            >
              <strong>Decode Your Birth Chart - LIVE Workshop</strong>
            </p>
          </div>

          <div style="display: flex; align-items: center; margin-bottom: 10px">
            <div
              style="
                margin-right: 10px;
                flex-shrink: 0;
                margin-top: 2px;
                font-size: 1.5rem;
              "
            >
              ✨
            </div>
            <p
              style="
                color: #333333;
                font-size: 14px;
                line-height: 1.4;
                margin: 0;
                margin-left: 15px;
              "
            >
              <strong>Career Alignment with Astrology & Psychology</strong>
            </p>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 10px">
            <div
              style="
                margin-right: 10px;
                flex-shrink: 0;
                margin-top: 2px;
                font-size: 1.5rem;
              "
            >
              🧠
            </div>
            <p
              style="
                color: #333333;
                font-size: 14px;
                line-height: 1.4;
                margin: 0;
                margin-left: 15px;
              "
            >
              <strong>Expert talk: Learn the right Parenting Tips!</strong>
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px">
          <a
            href="https://mentoons.com/mentoons-workshops"
            style="
              display: inline-block;
              background-color: #e39712;
              color: #ffffff;
              padding: 10px 20px;
              text-decoration: none;
              font-size: 16px;
              font-weight: bold;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            "
            >REGISTER NOW</a
          >
        </div>
        <div style="border-top: 2px dotted #000000; margin: 20px 0"></div>
      </div>

      <div style="margin-bottom: 20px; padding: 20px">
        <h2
          style="
            color: #000000;
            font-size: 24px;
            line-height: 1.5;
            text-align: center;
            padding-bottom: 20px;
            width: 90%;
            margin: auto;
          "
        >
          Fear of Missing Out? Here's the Highlight of our previous Workshop
        </h2>

        <div>
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Workshop Highlights"
            style="width: 100%; border-radius: 5px; margin-bottom: 15px"
          />
          <p
            style="color: #666666; font-size: 14px; line-height: 1.4; margin: 0"
          >
            This month, we welcomed Dr. Nisha. K, a renowned psychologist and
            astrologer specializing in career guidance and life coaching. Read
            their exclusive interview on how planetary shifts influence career
            success!
          </p>
          <div style="border-top: 2px dotted #000000; margin: 20px 0"></div>
        </div>
      </div>

      <div style="margin-bottom: 20px; padding: 20px">
        <div style="display: grid; grid-template-columns: 1fr; gap: 20px">
          <div
            style="
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              background-color: #fff;
              padding: 15px;
            "
          >
            <img
              src="https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fGZhbWlseXxlbnwwfHwwfHx8Mg%3D%3D"
              alt="Column 1"
              style="
                width: 100%;
                max-height: 150px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 10px;
              "
            />
            <h3 style="color: #333333; font-size: 18px; margin-bottom: 10px">
              What Parents say about us?
            </h3>
            <p
              style="
                color: #666666;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 15px;
              "
            >
              See how Mentoons Mythos has transformed lives! Read inspiring
              testimonials from our members who found career clarity and life
              purpose through our personalized reports and workshops.
            </p>
          </div>

          <div
            style="
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              background-color: #fff;
              padding: 15px;
            "
          >
            <img
              src="https://images.unsplash.com/photo-1588873281272-14886ba1f737?q=80&w=3425&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Column 2"
              style="
                width: 100%;
                max-height: 150px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 10px;
              "
            />
            <h3 style="color: #333333; font-size: 18px; margin-bottom: 10px">
              Join us as Psychologist!
            </h3>
            <p
              style="
                color: #666666;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 15px;
              "
            >
              This month, we welcome renowned psychologist and astrologer
              specializing in career guidance and life coaching.
            </p>
            <a
              href="https://mentoons.com/hiring"
              style="
                display: inline-block;
                background-color: #e39712;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 14px;
                margin-top: 10px;
              "
              >Apply Now</a
            >
          </div>

          <div
            style="
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              background-color: #fff;
              padding: 15px;
            "
          >
            <img
              src="https://images.unsplash.com/photo-1530099486328-e021101a494a?q=80&w=3347&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Column 3"
              style="
                width: 100%;
                max-height: 150px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 10px;
              "
            />
            <h3 style="color: #333333; font-size: 18px; margin-bottom: 10px">
              Create your own Group in Mentoons
            </h3>
            <p
              style="
                color: #666666;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 15px;
              "
            >
              Join the Discussion: Become a part of our exclusive online
              community and connect with like-minded individuals!
            </p>
            <a
              href="https://mentoons.com"
              style="
                display: inline-block;
                background-color: #e39712;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 14px;
                margin-top: 10px;
              "
              >View Now</a
            >
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px; padding-top: 20px; text-align: center">
        <h2
          style="
            color: #e39712;
            font-size: 24px;
            margin: 0;
            letter-spacing: 4px;
          "
        >
          🎉 LIVE CONTESTS -
        </h2>
        <h3
          style="
            color: #e39712;
            font-size: 26px;
            letter-spacing: 5px;
            margin: 5px 0 0 0;
          "
        >
          PARTICIPATE & WIN!
        </h3>
      </div>

      <div
        style="display: flex; flex-direction: column; gap: 15px; padding: 15px"
      >
        <div
          style="
            border-radius: 8px;
            border: #000 1px solid;
            padding: 15px;
            text-align: center;
          "
        >
          <h4 style="color: #333333; font-size: 16px; margin: 0 0 5px 0">
            THE ULTIMATE QUIZ TIME
          </h4>
          <div
            style="
              display: inline-flex;
              align-items: center;
              padding: 10px 0;
              font-size: 1.5rem;
            "
          >
            🌟
          </div>
          <p
            style="
              color: #666666;
              font-size: 14px;
              line-height: 1.4;
              margin: 0;
              text-align: center;
            "
          >
            Test your knowledge and win exciting prizes! Join our weekly quizzes
            on child psychology, astrology, and parenting tips.
          </p>
        </div>

        <div
          style="
            border-radius: 8px;
            border: #000 1px solid;
            padding: 15px;
            text-align: center;
          "
        >
          <h4 style="color: #333333; font-size: 16px; margin: 0 0 5px 0">
            GUESS THE PERSONALITY?
          </h4>
          <div
            style="
              display: inline-flex;
              align-items: center;
              padding: 10px 0;
              font-size: 1.5rem;
            "
          >
            📰
          </div>
          <p
            style="
              color: #666666;
              font-size: 14px;
              line-height: 1.4;
              margin: 0;
              text-align: center;
            "
          >
            Put your deduction skills to test! Analyze personality traits and
            zodiac signs to guess famous personalities. Win exclusive
            merchandise!
          </p>
        </div>

        <div
          style="
            border-radius: 8px;
            border: #000 1px solid;
            padding: 15px;
            text-align: center;
          "
        >
          <h4 style="color: #333333; font-size: 16px; margin: 0 0 5px 0">
            STORY-TELLING CONTEST
          </h4>
          <div
            style="
              display: inline-flex;
              align-items: center;
              padding: 10px 0;
              font-size: 1.5rem;
            "
          >
            📢
          </div>
          <p
            style="
              color: #666666;
              font-size: 14px;
              line-height: 1.4;
              margin: 0;
              text-align: center;
            "
          >
            Share your creative stories about personal growth, life lessons, or
            cosmic connections! Best stories win mentoring sessions with our
            experts.
          </p>
        </div>
      </div>

      <div
        style="
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          text-align: center;
        "
      >
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 15px;
          "
        >
          <div
            style="
              width: 100px;
              height: 100px;
              border-radius: 50%;
              overflow: hidden;
              margin: 0 10px;
              position: relative;
            "
          >
            <img
              src="https://images.unsplash.com/photo-1603217039863-aa0c865404f7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5mbHVlbmNlcnxlbnwwfHwwfHx8Mg%3D%3D"
              alt="Influencer 1"
              style="width: 100%; height: 100%; object-fit: cover"
            />
          </div>
          <div
            style="
              width: 100px;
              height: 100px;
              border-radius: 50%;
              overflow: hidden;
              margin: 0 10px;
              position: relative;
            "
          >
            <img
              src="https://images.unsplash.com/photo-1613053341085-db794820ce43?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aW5mbHVlbmNlcnxlbnwwfHwwfHx8Mg%3D%3D"
              alt="Influencer 2"
              style="width: 100%; height: 100%; object-fit: cover"
            />
          </div>
          <div
            style="
              width: 100px;
              height: 100px;
              border-radius: 50%;
              overflow: hidden;
              margin: 0 10px;
              position: relative;
            "
          >
            <img
              src="https://images.unsplash.com/photo-1556766920-b10a2bbb81c8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGluZmx1ZW5jZXJ8ZW58MHx8MHx8fDI%3D"
              alt="Influencer 3"
              style="width: 100%; height: 100%; object-fit: cover"
            />
          </div>
        </div>
        <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0">
          Influencer Spotlight
        </h3>
        <p
          style="
            color: #666666;
            font-size: 12px;
            line-height: 1.4;
            margin: 10px 0 0 0;
          "
        >
          Meet our expert speakers who will guide you in our upcoming workshops.
          Don't miss out!
        </p>
      </div>

      <div
        style="
          text-align: center;
          background-color: #e39712;
          padding: 20px;
          color: white;
        "
      >
        <div
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            max-width: 1000px;
            margin: 0 auto;
          "
        >
          <div style="text-align: center">
            <div
              style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
                justify-content: center;
              "
            >
              <span style="font-size: 1.5rem">📩</span>
              <span style="font-size: 14px">Stay Connected</span>
            </div>
            <div
              style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
                justify-content: center;
              "
            >
              <span style="font-size: 1.5rem">📧</span>
              <span style="font-size: 14px"
                >Need Guidance? Contact us at: support@mentoons.com</span
              >
            </div>
          </div>

          <div style="text-align: center">
            <h4 style="margin-bottom: 10px; font-size: 14px">SOCIAL MEDIA</h4>
            <div style="display: flex; gap: 8px; justify-content: center">
              <a
                href="https://www.facebook.com/people/Mentoons/100078693769495/"
                style="text-decoration: none"
              >
                <img
                  src="https://img.icons8.com/?size=100&id=98972&format=png&color=000000"
                  alt="Facebook"
                  style="
                    border-radius: 50%;
                    background-color: white;
                    padding: 2px;
                    width: 20px;
                    height: 20px;
                  "
                />
              </a>
              <a href="#" style="text-decoration: none">
                <img
                  src="https://img.icons8.com/?size=100&id=60014&format=png&color=000000"
                  alt="Twitter"
                  style="
                    border-radius: 50%;
                    background-color: white;
                    padding: 2px;
                    width: 20px;
                    height: 20px;
                  "
                />
              </a>
              <a
                href="https://www.instagram.com/toonmentoons?igsh=aTZvejJqYWM4YmFq"
                style="text-decoration: none"
              >
                <img
                  src="https://img.icons8.com/?size=100&id=59813&format=png&color=000000"
                  alt="Instagram"
                  style="
                    border-radius: 50%;
                    background-color: white;
                    padding: 2px;
                    width: 20px;
                    height: 20px;
                  "
                />
              </a>
              <a
                href="https://www.linkedin.com/company/mentoons"
                style="text-decoration: none"
              >
                <img
                  src="https://img.icons8.com/?size=100&id=102748&format=png&color=000000"
                  alt="LinkedIn"
                  style="
                    border-radius: 50%;
                    background-color: white;
                    padding: 2px;
                    width: 20px;
                    height: 20px;
                  "
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const AssessementReportEmailTemplate = () => {
  return ` <div class="container" style="max-width: 960px; background-color: #ffffff; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); padding: 32px; width: 100%;">
        <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
                <h1 class="report-title primary-color" style="font-size: 1.25rem; font-weight: 600; color: rgb(37, 99, 235); margin-top: 0; margin-bottom: 0;">Assessment Report</h1>
                <p class="report-date" style="font-size: 0.75rem; color: #6b7280; margin-top: 4px; margin-bottom: 0;">[Date]</p>
            </div>
        </div>

        <div class="personal-info" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; font-size: 0.875rem; color: #4b5563;">
            <div class="info-item" style="display: flex; align-items: center;">
                <div class="avatar-container" style="width: 48px; height: 48px; border-radius: 9999px; overflow: hidden; margin-right: 8px; background-color: #d1d5db; display: flex; align-items: center; justify-content: center;">
                    <img src="cid:user_placeholder" alt="User Avatar" class="avatar" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div>
                    <div class="info-label" style="font-weight: 600;">Name:</div>
                    <div>[Name]</div>
                </div>
            </div>
            <div>
                <div class="info-label" style="font-weight: 600;">DOB:</div>
                <div>[Date of Birth]</div>
            </div>
            <div>
                <div class="info-label" style="font-weight: 600;">Age:</div>
                <div>[Age]</div>
            </div>
            <div>
                <div class="info-label" style="font-weight: 600;">Rising Sign:</div>
                <div>[Rising Sign]</div>
            </div>
            <div>
                <div class="info-label" style="font-weight: 600;">Gender:</div>
                <div>[Gender]</div>
            </div>
            <div>
                <div class="info-label" style="font-weight: 600;">Location:</div>
                <div>[Location]</div>
            </div>
        </div>

        <div class="intelligence-profile accent-color" style="border-radius: 0.375rem; padding: 16px; margin-bottom: 24px; border: 1px solid; background-color: rgb(191, 219, 254); border-color: rgb(191, 219, 254);">
            <h2 class="intelligence-title primary-color" style="font-size: 0.875rem; font-weight: 600; color: rgb(37, 99, 235); margin-top: 0; margin-bottom: 0;">[Intelligence Type]</h2>
            <p class="intelligence-description" style="font-size: 0.875rem; color: #374151; margin-top: 8px; margin-bottom: 0;">[Intelligence Description]</p>
        </div>

        <div class="emotional-health" style="margin-bottom: 24px;">
            <h3 class="emotional-health-title" style="font-size: 1.125rem; font-weight: 600; color: #1f2937; margin-top: 0; margin-bottom: 8px;">Emotional Health Breakdown</h3>
            <div style="overflow-x: auto;">
                <table class="emotional-health-table" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; font-size: 0.875rem;">
                    <thead class="emotional-health-thead" style="background-color: rgb(191, 219, 254);">
                        <tr>
                            <th class="emotional-health-th" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: 600; color: #374151;">Element</th>
                            <th class="emotional-health-th" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: 600; color: #374151;">Status</th>
                            <th class="emotional-health-th" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: 600; color: #374151;">Responsibility</th>
                            <th class="emotional-health-th" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: 600; color: #374151;">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">Interpersonal Intelligence</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Status]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Responsibility]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Notes]</td>
                        </tr>
                        <tr>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">Linguistic Intelligence</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Status]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Responsibility]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Notes]</td>
                        </tr>
                        <tr>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">Confidence (Sun Position)</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Status]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Responsibility]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Notes]</td>
                        </tr>
                        <tr>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">Emotional Sensitivity (Moon Position)</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Status]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Responsibility]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Notes]</td>
                        </tr>
                        <tr>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">Communication Skills (Mercury Influence)</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Status]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Responsibility]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Notes]</td>
                        </tr>
                        <tr>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">Social Impact</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Status]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Responsibility]</td>
                            <td class="emotional-health-td" style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; font-weight: normal; color: #374151;">[Notes]</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="recommendations" style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 24px; font-size: 0.875rem; color: #374151;">
            <div class="recommendation-item" style="background-color: #f9fafb; border-radius: 0.375rem; padding: 16px; border: 1px solid #f3f4f6; display: flex; align-items: flex-start;">
                <img src="cid:lightbulb_icon" alt="Known Issues" class="recommendation-icon" style="width: 24px; height: 24px; margin-right: 8px; color: rgb(37, 99, 235);">
                <div>
                    <h4 class="recommendation-title" style="font-weight: 600; margin-top: 0; margin-bottom: 4px;">Known issues:</h4>
                    <p class="recommendation-text" style="font-size: 0.75rem; margin-top: 0; margin-bottom: 0;">[Known Issues]</p>
                </div>
            </div>
            <div class="recommendation-item" style="background-color: #f9fafb; border-radius: 0.375rem; padding: 16px; border: 1px solid #f3f4f6; display: flex; align-items: flex-start;">
                <img src="cid:exclamation_icon" alt="Potential Risks" class="recommendation-icon" style="width: 24px; height: 24px; margin-right: 8px; color: rgb(37, 99, 235);">
                <div>
                    <h4 class="recommendation-title" style="font-weight: 600; margin-top: 0; margin-bottom: 4px;">Potential risks:</h4>
                    <p class="recommendation-text" style="font-size: 0.75rem; margin-top: 0; margin-bottom: 0;">[Potential Risks]</p>
                </div>
            </div>
            <div class="recommendation-item" style="background-color: #f9fafb; border-radius: 0.375rem; padding: 16px; border: 1px solid #f3f4f6; display: flex; align-items: flex-start;">
                <img src="cid:document_icon" alt="Change Request" class="recommendation-icon" style="width: 24px; height: 24px; margin-right: 8px; color: rgb(37, 99, 235);">
                <div>
                    <h4 class="recommendation-title" style="font-weight: 600; margin-top: 0; margin-bottom: 4px;">Change request:</h4>
                    <p class="recommendation-text" style="font-size: 0.75rem; margin-top: 0; margin-bottom: 0;">[Change Request]</p>
                </div>
            </div>
        </div>
        <div style="margin-bottom: 12px;">
            <h3 class="key-takeaways-title" style="font-size: 1.125rem; font-weight: 600; color: #1f2937; margin-top: 0; margin-bottom: 8px;">Key Take Aways</h3>
            <div style="margin-bottom: 12px;">
                <h4 class="key-attributes-title" style="font-size: 0.875rem; font-weight: 600; color: #374151; margin-top: 0; margin-bottom: 4px;">Key Attributes:</h4>
                <ul class="key-attributes-list" style="list-style-type: disc; padding-left: 20px; font-size: 0.875rem; color: #4b5563; margin-top: 0; margin-bottom: 12px;">
                    <li>[Attribute 1]</li>
                    <li>[Attribute 2]</li><li>[Attribute 3]</li>
                </ul>
            </div>
            <div style="margin-bottom: 12px;">
                <h4 class="areas-excellence-title" style="font-size: 0.875rem; font-weight: 600; color: #374151; margin-top: 0; margin-bottom: 4px;">Areas of Excellence:</h4>
                <p class="areas-excellence-text" style="font-size: 0.875rem; color: #4b5563; margin-top: 0; margin-bottom: 12px;">[Areas of Excellence]</p>
            </div>
            <div>
                <h4 class="growth-strategies-title" style="font-size: 0.875rem; font-weight: 600; color: #374151; margin-top: 0; margin-bottom: 4px;">Growth Strategies:</h4>
                <ul class="growth-strategies-list" style="list-style-type: disc; padding-left: 20px; font-size: 0.875rem; color: #4b5563; margin-top: 0; margin-bottom: 0;">
                    <li>[Strategy 1]</li>
                    <li>[Strategy 2]</li>
                    <li>[Strategy 3]</li>
                </ul>
            </div>
        </div>
    </div>`;
};

module.exports = {
  ProductEmailTemplate,
  SubscriptionEmailTemplate,
  WelcomeEmailTemplate,
};
